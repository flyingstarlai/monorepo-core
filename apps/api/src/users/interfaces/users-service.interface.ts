export interface IUsersService {
  findById(id: string): Promise<any>;
  findByUsername(username: string): Promise<any>;
  create(createUserDto: any, creatorRole?: string): Promise<any>;
  update(id: string, updateUserDto: any, updaterRole?: string): Promise<any>;
  delete(id: string): Promise<void>;
  findAll(): Promise<any>;
  validateUserCredentials(username: string, password: string): Promise<any>;
  login(user: any): Promise<any>;
  findRawById(id: string): Promise<any>;
  findWithFilters(filters: any): Promise<{ users: any[]; total: number }>;
  findOne(id: string): Promise<any>;
  searchUsers(query: string): Promise<any>;
  updateProfile(id: string, updateProfileDto: any): Promise<any>;
  changePassword(id: string, changePasswordDto: any): Promise<void>;
  remove(id: string): Promise<void>;
}
