/**
 * Authentication Types
 * Type-safe authentication interfaces following SOLID principles
 */

import type { Prettify } from "./common";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Membership {
  id: string;
  userId: string;
  organizationId: string;
  role: MembershipRole;
  status: MembershipStatus;
  joinedAt: Date;
  user: User;
  organization: Organization;
}

export interface Invitation {
  id: string;
  email: string;
  organizationId: string;
  role: MembershipRole;
  status: InvitationStatus;
  expiresAt: Date;
  createdAt: Date;
  organization: Organization;
}

export interface Session {
  user: User;
  organization?: Organization;
  expiresAt: Date;
  token: string;
}

export interface AuthState {
  user: User | null;
  organization: Organization | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  organizationName?: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  image?: string;
}

export interface CreateOrganizationData {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateOrganizationData {
  name?: string;
  slug?: string;
  description?: string;
  logo?: string;
}

export interface InviteUserData {
  email: string;
  role: MembershipRole;
  organizationId: string;
}

export interface AcceptInvitationData {
  invitationId: string;
  userId: string;
}

export interface RejectInvitationData {
  invitationId: string;
}

export interface UpdateMembershipData {
  membershipId: string;
  role: MembershipRole;
}

export interface RemoveMembershipData {
  membershipId: string;
}

export interface TwoFactorSetupData {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorVerifyData {
  code: string;
  backupCode?: string;
}

export interface EmailOTPData {
  email: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password";
}

export interface SocialProvider {
  name: "github" | "google";
  clientId: string;
  clientSecret: string;
}

export interface AuthProvider {
  name: string;
  type: "credentials" | "social" | "otp";
  enabled: boolean;
  config?: Record<string, any>;
}

export interface AuthConfig {
  providers: AuthProvider[];
  session: {
    strategy: "jwt" | "database";
    maxAge: number;
    updateAge: number;
  };
  pages: {
    signIn: string;
    signUp: string;
    error: string;
  };
  callbacks: {
    jwt?: (token: any, user?: User) => any;
    session?: (session: any, token: any) => any;
    redirect?: (url: string, baseUrl: string) => string;
  };
}

export interface AuthService {
  login(credentials: LoginCredentials): Promise<ServiceResult<Session>>;
  register(data: RegisterData): Promise<ServiceResult<Session>>;
  logout(): Promise<ServiceResult<void>>;
  refreshToken(): Promise<ServiceResult<Session>>;
  resetPassword(data: ResetPasswordData): Promise<ServiceResult<void>>;
  changePassword(data: ChangePasswordData): Promise<ServiceResult<void>>;
  updateProfile(data: UpdateProfileData): Promise<ServiceResult<User>>;
  getCurrentUser(): Promise<ServiceResult<User>>;
  getCurrentSession(): Promise<ServiceResult<Session>>;
  verifyEmail(token: string): Promise<ServiceResult<void>>;
  resendVerificationEmail(): Promise<ServiceResult<void>>;
  setupTwoFactor(): Promise<ServiceResult<TwoFactorSetupData>>;
  verifyTwoFactor(data: TwoFactorVerifyData): Promise<ServiceResult<void>>;
  disableTwoFactor(): Promise<ServiceResult<void>>;
  sendOTP(
    email: string,
    type: EmailOTPData["type"]
  ): Promise<ServiceResult<void>>;
  verifyOTP(data: EmailOTPData): Promise<ServiceResult<Session>>;
}

export interface OrganizationService {
  create(data: CreateOrganizationData): Promise<ServiceResult<Organization>>;
  update(
    id: string,
    data: UpdateOrganizationData
  ): Promise<ServiceResult<Organization>>;
  delete(id: string): Promise<ServiceResult<void>>;
  getById(id: string): Promise<ServiceResult<Organization>>;
  getBySlug(slug: string): Promise<ServiceResult<Organization>>;
  list(
    params?: PaginationParams
  ): Promise<ServiceResult<PaginationResult<Organization>>>;
  getMembers(organizationId: string): Promise<ServiceResult<Membership[]>>;
  inviteUser(data: InviteUserData): Promise<ServiceResult<Invitation>>;
  acceptInvitation(
    data: AcceptInvitationData
  ): Promise<ServiceResult<Membership>>;
  rejectInvitation(data: RejectInvitationData): Promise<ServiceResult<void>>;
  updateMembership(
    data: UpdateMembershipData
  ): Promise<ServiceResult<Membership>>;
  removeMembership(data: RemoveMembershipData): Promise<ServiceResult<void>>;
  leaveOrganization(organizationId: string): Promise<ServiceResult<void>>;
}

export interface AuthRepository {
  findUserById(id: string): Promise<RepositoryResult<User>>;
  findUserByEmail(email: string): Promise<RepositoryResult<User>>;
  createUser(
    user: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<RepositoryResult<User>>;
  updateUser(id: string, data: Partial<User>): Promise<RepositoryResult<User>>;
  deleteUser(id: string): Promise<RepositoryResult<void>>;
  findSessionByToken(token: string): Promise<RepositoryResult<Session>>;
  createSession(
    session: Omit<Session, "id">
  ): Promise<RepositoryResult<Session>>;
  updateSession(
    token: string,
    data: Partial<Session>
  ): Promise<RepositoryResult<Session>>;
  deleteSession(token: string): Promise<RepositoryResult<void>>;
  findOrganizationById(id: string): Promise<RepositoryResult<Organization>>;
  findOrganizationBySlug(slug: string): Promise<RepositoryResult<Organization>>;
  createOrganization(
    org: Omit<Organization, "id" | "createdAt" | "updatedAt">
  ): Promise<RepositoryResult<Organization>>;
  updateOrganization(
    id: string,
    data: Partial<Organization>
  ): Promise<RepositoryResult<Organization>>;
  deleteOrganization(id: string): Promise<RepositoryResult<void>>;
  findMembership(
    userId: string,
    organizationId: string
  ): Promise<RepositoryResult<Membership>>;
  createMembership(
    membership: Omit<Membership, "id" | "joinedAt">
  ): Promise<RepositoryResult<Membership>>;
  updateMembership(
    id: string,
    data: Partial<Membership>
  ): Promise<RepositoryResult<Membership>>;
  deleteMembership(id: string): Promise<RepositoryResult<void>>;
  findInvitationById(id: string): Promise<RepositoryResult<Invitation>>;
  findInvitationByEmail(
    email: string,
    organizationId: string
  ): Promise<RepositoryResult<Invitation>>;
  createInvitation(
    invitation: Omit<Invitation, "id" | "createdAt">
  ): Promise<RepositoryResult<Invitation>>;
  updateInvitation(
    id: string,
    data: Partial<Invitation>
  ): Promise<RepositoryResult<Invitation>>;
  deleteInvitation(id: string): Promise<RepositoryResult<void>>;
}

export type UserRole = "ADMIN" | "GERENTE" | "USUARIO";

export type MembershipRole = "OWNER" | "ADMIN" | "MEMBER";

export type MembershipStatus = "ACTIVE" | "INACTIVE" | "PENDING";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";

export type AuthSession = Prettify<Session>;

export type AuthOrganization = Prettify<
  Organization & {
    members: Prettify<
      Membership & {
        user: {
          id: string;
          name: string;
          email: string;
          image?: string | null;
        };
      }
    >[];
    invitations: Invitation[];
  }
>;
