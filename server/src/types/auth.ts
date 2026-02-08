export type RegisterRequestBody = {
  email: string;
  password: string;
};

export type RegisterResponseBody = {
  token: string;
};

export type LoginRequestBody = {
  email: string;
  password: string;
};

export type LoginResponseBody = {
  token: string;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
};
