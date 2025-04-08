export interface RegistrationFormData {
    name: string;
    email: string;
    skillLevel: SkillLevel;
    password: string;
}

export enum SkillLevel {
    Beginner = 'beginner',
    Intermediate = 'intermediate',
    Advanced = 'advanced',
}

export interface User {
    _id?: string;
    name: string;
    email: string;
    role: string;
    image?: string;
    skillLevel: SkillLevel;
    createdAt: string;
    updatedAt: string;
    gamesOrganized?: string[];
    gamesJoined?: string[];
}