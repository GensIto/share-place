import { IUserRepository } from "../../infrastructure/repository/UserRepository";
import { UserId, UserName, EmailAddress } from "../../domain/value-object";
import { User as UserEntity } from "../../domain/entities";

export interface UpsertUserInput {
  userId: string; // Firebase Authのuid
  name: string;
  email: string | null;
  image: string | null;
  isAnonymous: boolean;
  emailVerified: boolean;
}

export class UpsertUserUseCase {
  public constructor(private readonly userRepository: IUserRepository) {}

  public async invoke(input: UpsertUserInput): Promise<UserEntity> {
    // Firebase Authのuidをそのまま使用
    const userId = UserId.ofFirebase(input.userId);
    const userName = UserName.of(input.name || "Anonymous User");

    // 匿名ユーザーの場合、emailがnullの可能性がある
    const email = input.email
      ? EmailAddress.of(input.email)
      : EmailAddress.of(`${input.userId}@anonymous.local`); // ダミーemail

    const user = UserEntity.of(
      userId,
      userName,
      email,
      input.image,
      new Date(),
      new Date()
    );

    return await this.userRepository.upsert(
      user,
      input.isAnonymous,
      input.emailVerified
    );
  }
}
