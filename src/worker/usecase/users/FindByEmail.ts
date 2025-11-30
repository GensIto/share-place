import { IUserRepository } from "../../infrastructure/repository/UserRepository";
import { EmailAddress } from "../../domain/value-object";
import { User } from "../../domain/entities";

export class FindByEmailUseCase {
  public constructor(private readonly userRepository: IUserRepository) {}

  public async invoke(email: EmailAddress): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    return user;
  }
}
