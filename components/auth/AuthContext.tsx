import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Family, AuthContextType } from '../../types';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { famBalanceService } from '../../services/famBalanceService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const loadAuthData = useCallback(async () => {
    setLoading(true);
    const { user, family } = await authService.getCurrentUserAndFamily();
    if (user && family) {
      setCurrentUser(user);
      setCurrentFamily(family);
      setIsAuthenticated(true);
    } else {
      setCurrentUser(null);
      setCurrentFamily(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAuthData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const login = useCallback(async (name: string, password: string, isFamilyLogin: boolean) => {
    setLoading(true);
    const result = await authService.login(name, password, isFamilyLogin);
    setLoading(false);
    if (result.success && result.user && result.family) {
      setCurrentUser(result.user);
      setCurrentFamily(result.family);
      setIsAuthenticated(true);
      localStorage.setItem('currentUserId', result.user.id);
      localStorage.setItem('currentFamilyId', result.family.id);
      navigate('/dashboard');
      return true;
    }
    return false;
  }, [navigate]);

  const logout = useCallback(async () => {
    setLoading(true);
    await authService.logout();
    setCurrentUser(null);
    setCurrentFamily(null);
    setIsAuthenticated(false);
    setLoading(false);
    navigate('/login');
  }, [navigate]);

  const registerFamily = useCallback(async (familyName: string, adminEmail: string, familyPassword: string, adminName: string, adminBirthDate: string, adminGender: 'Feminino' | 'Masculino' | 'Outro', adminAvatar: string) => {
    setLoading(true);
    const result = await authService.registerFamily(familyName, adminEmail, familyPassword, adminName, adminBirthDate, adminGender, adminAvatar);
    setLoading(false);
    return result;
  }, []);

  const addMemberToFamily = useCallback(async (familyId: string, memberName: string, memberBirthDate: string, memberGender: 'Feminino' | 'Masculino' | 'Outro', memberAvatar: string, memberPassword?: string) => {
    setLoading(true);
    const result = await authService.addMemberToFamily(familyId, memberName, memberBirthDate, memberGender, memberAvatar, memberPassword);
    setLoading(false);
    if (result.success) {
      // Reload family data to get updated member list
      await loadAuthData();
    }
    return result;
  }, [loadAuthData]);

  const joinFamilyWithCode = useCallback(async (inviteCode: string, memberName: string, memberBirthDate: string, memberGender: 'Feminino' | 'Masculino' | 'Outro', memberAvatar: string, memberPassword?: string) => {
    setLoading(true);
    const result = await authService.joinFamilyWithCode(inviteCode, memberName, memberBirthDate, memberGender, memberAvatar, memberPassword);
    setLoading(false);
    if (result.success && result.memberId && result.familyId) {
      // Simulate login for the new member
      const loginResult = await authService.login(memberName, memberPassword || '', false);
      if (loginResult.success && loginResult.user && loginResult.family) {
        setCurrentUser(loginResult.user);
        setCurrentFamily(loginResult.family);
        setIsAuthenticated(true);
        localStorage.setItem('currentUserId', loginResult.user.id);
        localStorage.setItem('currentFamilyId', loginResult.family.id);
        navigate('/dashboard');
      }
    }
    return result;
  }, [navigate]);

  const updateUser = useCallback(async (user: User) => {
    const result = await authService.updateUserProfile(user);
    if (result.success) {
      // If the updated user is the current user, update the context state
      if (currentUser?.id === user.id) {
        setCurrentUser(result.user!);
      }
      // No need to call loadAuthData here, as it may overwrite with stale data
      // The update is confirmed, so we can trust the result.
    }
  }, [currentUser?.id]);
  

  const updateFamily = useCallback(async (family: Family) => {
    const result = await authService.updateFamilyProfile(family);
    if (result.success) {
      setCurrentFamily(result.family!);
      // Also update famBalanceService's family storage to reflect changes
      await loadAuthData();
    }
  }, [loadAuthData]);
  
  const isTrialActive = currentFamily ? new Date(currentFamily.trialEndsAt || 0) > new Date() : false;
  const effectiveIsPremium = currentFamily?.isPremium || isTrialActive;

  const value = {
    currentUser,
    currentFamily,
    isAuthenticated,
    loading,
    effectiveIsPremium,
    login,
    logout,
    registerFamily,
    addMemberToFamily,
    joinFamilyWithCode,
    updateUser,
    updateFamily,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};