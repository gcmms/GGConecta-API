export enum Role {
  ADMIN = 'Administrador',
  MEMBER = 'Membro',
  NON_MEMBER = 'Não membro'
}

export const roleHierarchy = [Role.ADMIN, Role.MEMBER, Role.NON_MEMBER];
