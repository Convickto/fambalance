import { User, Family, UserRole } from '../types';
import { v4 as uuidv4 } from 'uuid';

const USERS_STORAGE_KEY = 'famBalanceUsers';
const FAMILIES_STORAGE_KEY = 'famBalanceFamilies';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const saveToLocalStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const loadFromLocalStorage = (key: string) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const authService = {
  async registerFamily(familyName: string, adminEmail: string, familyPassword: string, adminName: string, adminBirthDate: string, adminGender: 'Feminino' | 'Masculino' | 'Outro', adminAvatar: string) {
    await delay(500); // Simulate API call

    const families: Family[] = loadFromLocalStorage(FAMILIES_STORAGE_KEY);
    if (families.some(f => f.name === familyName)) {
      return { success: false, error: 'Nome da família já existe.' };
    }

    const users: User[] = loadFromLocalStorage(USERS_STORAGE_KEY);
    if (users.some(u => u.email === adminEmail)) {
      return { success: false, error: 'Email do administrador já registrado.' };
    }

    const familyId = uuidv4();
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase(); // Simple invite code
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial

    const newFamily: Family = {
      id: familyId,
      name: familyName,
      familyPassword: familyPassword, // In a real app, this would be hashed
      adminId: '', // Will be set after admin user is created
      memberIds: [],
      inviteCode,
      isPremium: false, // Default to free plan
      createdAt: new Date().toISOString(),
      trialEndsAt: trialEndDate.toISOString(),
    };

    const adminUser: User = {
      id: uuidv4(),
      name: adminName,
      birthDate: adminBirthDate,
      gender: adminGender,
      avatar: adminAvatar,
      familyId,
      email: adminEmail,
      password: familyPassword, // Admin user uses family password by default
      role: UserRole.ADMIN,
      harmonyPoints: 0,
      connectionPoints: 0,
    };

    newFamily.adminId = adminUser.id;
    newFamily.memberIds.push(adminUser.id);

    families.push(newFamily);
    users.push(adminUser);

    saveToLocalStorage(FAMILIES_STORAGE_KEY, families);
    saveToLocalStorage(USERS_STORAGE_KEY, users);

    return { success: true, familyId: newFamily.id, adminId: adminUser.id };
  },

  async addMemberToFamily(familyId: string, memberName: string, memberBirthDate: string, memberGender: 'Feminino' | 'Masculino' | 'Outro', memberAvatar: string, memberPassword?: string) {
    await delay(500); // Simulate API call

    const families: Family[] = loadFromLocalStorage(FAMILIES_STORAGE_KEY);
    const users: User[] = loadFromLocalStorage(USERS_STORAGE_KEY);

    const familyIndex = families.findIndex(f => f.id === familyId);
    if (familyIndex === -1) {
      return { success: false, error: 'Família não encontrada.' };
    }

    const existingMember = users.find(u => u.familyId === familyId && u.name === memberName);
    if (existingMember) {
      return { success: false, error: `Um membro com o nome '${memberName}' já existe nesta família.` };
    }

    const newMember: User = {
      id: uuidv4(),
      name: memberName,
      birthDate: memberBirthDate,
      gender: memberGender,
      avatar: memberAvatar,
      familyId,
      password: memberPassword, // Optional individual password
      role: UserRole.MEMBER,
      harmonyPoints: 0,
      connectionPoints: 0,
    };

    families[familyIndex].memberIds.push(newMember.id);
    users.push(newMember);

    saveToLocalStorage(FAMILIES_STORAGE_KEY, families);
    saveToLocalStorage(USERS_STORAGE_KEY, users);

    return { success: true, memberId: newMember.id };
  },

  async joinFamilyWithCode(inviteCode: string, memberName: string, memberBirthDate: string, memberGender: 'Feminino' | 'Masculino' | 'Outro', memberAvatar: string, memberPassword?: string) {
    await delay(500); // Simulate API call

    const families: Family[] = loadFromLocalStorage(FAMILIES_STORAGE_KEY);
    const users: User[] = loadFromLocalStorage(USERS_STORAGE_KEY);

    const targetFamily = families.find(f => f.inviteCode === inviteCode);
    if (!targetFamily) {
      return { success: false, error: 'Código de convite inválido.' };
    }

    const existingMember = users.find(u => u.familyId === targetFamily.id && u.name === memberName);
    if (existingMember) {
      return { success: false, error: `Um membro com o nome '${memberName}' já existe nesta família.` };
    }

    const newMember: User = {
      id: uuidv4(),
      name: memberName,
      birthDate: memberBirthDate,
      familyId: targetFamily.id,
      password: memberPassword,
      gender: memberGender,
      avatar: memberAvatar,
      role: UserRole.MEMBER,
      harmonyPoints: 0,
      connectionPoints: 0,
    };

    targetFamily.memberIds.push(newMember.id);
    users.push(newMember);

    saveToLocalStorage(FAMILIES_STORAGE_KEY, families);
    saveToLocalStorage(USERS_STORAGE_KEY, users);

    return { success: true, familyId: targetFamily.id, memberId: newMember.id };
  },

  async login(name: string, password: string, isFamilyLogin: boolean): Promise<{ success: boolean; user?: User; family?: Family; error?: string }> {
    await delay(500); // Simulate API call

    const users: User[] = loadFromLocalStorage(USERS_STORAGE_KEY);
    const families: Family[] = loadFromLocalStorage(FAMILIES_STORAGE_KEY);

    if (isFamilyLogin) {
      const family = families.find(f => f.name === name && f.familyPassword === password);
      if (family) {
        // Log in as the admin of the family
        const adminUser = users.find(u => u.id === family.adminId);
        if (adminUser) {
          return { success: true, user: adminUser, family };
        }
      }
      return { success: false, error: 'Nome da família ou senha incorretos.' };
    } else {
      const user = users.find(u => u.name === name && u.password === password);
      if (user) {
        const family = families.find(f => f.id === user.familyId);
        return { success: true, user, family };
      }
      return { success: false, error: 'Nome de usuário ou senha incorretos.' };
    }
  },

  async logout() {
    await delay(100); // Simulate API call
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentFamilyId');
    return { success: true };
  },

  async getCurrentUserAndFamily(): Promise<{ user: User | null; family: Family | null }> {
    await delay(100); // Simulate API call
    const currentUserId = localStorage.getItem('currentUserId');
    const currentFamilyId = localStorage.getItem('currentFamilyId');

    if (currentUserId && currentFamilyId) {
      const users: User[] = loadFromLocalStorage(USERS_STORAGE_KEY);
      const families: Family[] = loadFromLocalStorage(FAMILIES_STORAGE_KEY);
      const user = users.find(u => u.id === currentUserId);
      const family = families.find(f => f.id === currentFamilyId);
      return { user: user || null, family: family || null };
    }
    return { user: null, family: null };
  },

  async updateUserProfile(updatedUser: User) {
    await delay(300);
    const users: User[] = loadFromLocalStorage(USERS_STORAGE_KEY);
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      saveToLocalStorage(USERS_STORAGE_KEY, users);
      return { success: true, user: updatedUser };
    }
    return { success: false, error: 'Usuário não encontrado.' };
  },

  async updateFamilyProfile(updatedFamily: Family) {
    await delay(300);
    const families: Family[] = loadFromLocalStorage(FAMILIES_STORAGE_KEY);
    const index = families.findIndex(f => f.id === updatedFamily.id);
    if (index !== -1) {
      families[index] = updatedFamily;
      saveToLocalStorage(FAMILIES_STORAGE_KEY, families);
      return { success: true, family: updatedFamily };
    }
    return { success: false, error: 'Família não encontrada.' };
  },

  async getFamilyMembers(familyId: string): Promise<User[]> {
    await delay(200);
    const users: User[] = loadFromLocalStorage(USERS_STORAGE_KEY);
    return users.filter(u => u.familyId === familyId);
  },

  async requestPasswordReset(familyName: string, adminEmail: string) {
    await delay(500);
    const families: Family[] = loadFromLocalStorage(FAMILIES_STORAGE_KEY);
    const users: User[] = loadFromLocalStorage(USERS_STORAGE_KEY);
    const family = families.find(f => f.name === familyName);
    if (!family) {
        return { success: false, error: 'Família não encontrada.' };
    }
    const admin = users.find(u => u.id === family.adminId);
    if (admin && admin.email === adminEmail) {
        // In a real app, you would trigger an email send here.
        return { success: true };
    }
    return { success: false, error: 'As informações não correspondem a uma família registrada.' };
  },
};