export type UserRole = "student" | "teacher" | "admin";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  cne?: string;
  filiere?: string;
  department?: string;
}

export interface Subject {
  id: string;
  name: string;
  teacherId: string;
}

export interface Complaint {
  id: string;
  studentId: string;
  subjectId: string;
  teacherId: string;
  grade: number;
  description: string;
  status: "pending" | "accepted" | "rejected";
  teacherComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const mockUsers: User[] = [
  { id: "s1", email: "ahmed@etu.ma", firstName: "Ahmed", lastName: "Benali", role: "student", cne: "R130456789", filiere: "Informatique" },
  { id: "s2", email: "sara@etu.ma", firstName: "Sara", lastName: "El Amrani", role: "student", cne: "R130456790", filiere: "Mathématiques" },
  { id: "s3", email: "youssef@etu.ma", firstName: "Youssef", lastName: "Moussaoui", role: "student", cne: "R130456791", filiere: "Informatique" },
  { id: "t1", email: "prof.alami@univ.ma", firstName: "Mohamed", lastName: "Alami", role: "teacher", department: "Informatique" },
  { id: "t2", email: "prof.fassi@univ.ma", firstName: "Fatima", lastName: "Fassi", role: "teacher", department: "Mathématiques" },
  { id: "a1", email: "admin@univ.ma", firstName: "Admin", lastName: "Système", role: "admin" },
];

export const mockSubjects: Subject[] = [
  { id: "sub1", name: "Programmation Java", teacherId: "t1" },
  { id: "sub2", name: "Bases de Données", teacherId: "t1" },
  { id: "sub3", name: "Analyse Numérique", teacherId: "t2" },
  { id: "sub4", name: "Algèbre Linéaire", teacherId: "t2" },
];

export const mockComplaints: Complaint[] = [
  { id: "c1", studentId: "s1", subjectId: "sub1", teacherId: "t1", grade: 8, description: "Je pense qu'il y a une erreur dans la correction de l'exercice 3. J'ai bien implémenté le pattern Singleton.", status: "pending", createdAt: "2026-03-20T10:30:00", updatedAt: "2026-03-20T10:30:00" },
  { id: "c2", studentId: "s1", subjectId: "sub3", teacherId: "t2", grade: 11, description: "Ma copie contient la méthode de Newton correctement appliquée mais n'a pas été comptabilisée.", status: "accepted", teacherComment: "Effectivement, la question 4 n'avait pas été corrigée. Note corrigée à 14.", createdAt: "2026-03-15T08:00:00", updatedAt: "2026-03-18T14:00:00" },
  { id: "c3", studentId: "s2", subjectId: "sub4", teacherId: "t2", grade: 6, description: "J'ai répondu à toutes les questions de l'examen mais ma note ne reflète pas mes réponses.", status: "rejected", teacherComment: "Après vérification, la correction est conforme au barème. Les réponses aux questions 2 et 5 étaient incomplètes.", createdAt: "2026-03-10T09:00:00", updatedAt: "2026-03-14T11:00:00" },
  { id: "c4", studentId: "s3", subjectId: "sub2", teacherId: "t1", grade: 9, description: "Le résultat de ma requête SQL était correct mais a été compté comme faux.", status: "pending", createdAt: "2026-03-22T16:00:00", updatedAt: "2026-03-22T16:00:00" },
];

export const mockNotifications: Notification[] = [
  { id: "n1", userId: "t1", message: "Nouvelle réclamation de Ahmed Benali pour Programmation Java", read: false, createdAt: "2026-03-20T10:30:00" },
  { id: "n2", userId: "s1", message: "Votre réclamation pour Analyse Numérique a été acceptée", read: true, createdAt: "2026-03-18T14:00:00" },
  { id: "n3", userId: "t1", message: "Nouvelle réclamation de Youssef Moussaoui pour Bases de Données", read: false, createdAt: "2026-03-22T16:00:00" },
];

export function getUserById(id: string) {
  return mockUsers.find(u => u.id === id);
}

export function getSubjectById(id: string) {
  return mockSubjects.find(s => s.id === id);
}

export function getSubjectsByTeacher(teacherId: string) {
  return mockSubjects.filter(s => s.teacherId === teacherId);
}

export function getComplaintsByStudent(studentId: string) {
  return mockComplaints.filter(c => c.studentId === studentId);
}

export function getComplaintsByTeacher(teacherId: string) {
  return mockComplaints.filter(c => c.teacherId === teacherId);
}

export function getNotificationsByUser(userId: string) {
  return mockNotifications.filter(n => n.userId === userId);
}
