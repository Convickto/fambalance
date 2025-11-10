import React from 'react';
import { User } from '../../types';
import Card from '../ui/Card';

interface UpcomingBirthdaysProps {
  members: User[];
}

const calculateAge = (birthDateString: string): number => {
    if (!birthDateString) return 0;
    const birthDate = new Date(birthDateString);
    // Add timezone offset to avoid date shifting issues
    birthDate.setMinutes(birthDate.getMinutes() + birthDate.getTimezoneOffset());
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const UpcomingBirthdays: React.FC<UpcomingBirthdaysProps> = ({ members }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = members
    .map(member => {
      if (!member.birthDate) return null;
      
      const birthDate = new Date(member.birthDate);
      birthDate.setMinutes(birthDate.getMinutes() + birthDate.getTimezoneOffset());
      
      const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      
      if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
      }
      
      const diffTime = nextBirthday.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 30) {
        return {
          ...member,
          daysUntil: diffDays,
          nextBirthday,
          turningAge: calculateAge(member.birthDate) + 1
        };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => a!.daysUntil - b!.daysUntil);

  if (upcoming.length === 0) {
    return null; // Don't render the card if there are no upcoming birthdays
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Próximos Aniversários</h2>
      <ul className="space-y-3">
        {upcoming.map(member => (
          <li key={member!.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-3">{member!.avatar}</span>
              <div>
                <p className="font-semibold text-gray-800">{member!.name}</p>
                <p className="text-sm text-gray-600">
                  {member!.nextBirthday.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })} (faz {member!.turningAge} anos)
                </p>
              </div>
            </div>
            <div className="text-center">
                {member!.daysUntil === 0 ? (
                    <span className="font-bold text-lg text-green-600">É hoje! 🎉</span>
                ) : (
                    <>
                        <p className="font-bold text-lg text-blue-600">{member!.daysUntil}</p>
                        <p className="text-xs text-gray-500">dias</p>
                    </>
                )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default UpcomingBirthdays;
