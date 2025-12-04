import { IUserRepository } from "../../infrastructure/repository/UserRepository";
import { UserId, EmailAddress } from "../../domain/value-object";
import { User as UserEntity } from "../../domain/entities";

export interface UpsertUserInput {
  userId: string; // Firebase Authのuid
  email: string | null;
}

export class UpsertUserUseCase {
  public constructor(private readonly userRepository: IUserRepository) {}

  public async invoke(input: UpsertUserInput): Promise<UserEntity> {
    // Firebase Authのuidをそのまま使用
    const userId = UserId.ofFirebase(input.userId);

    // 匿名ユーザーの場合、emailがnullの可能性がある
    // ただし、usersテーブルではemailは必須なので、ダミーemailを使用
    const email = input.email
      ? EmailAddress.of(input.email)
      : EmailAddress.of(`${input.userId}@anonymous.local`); // ダミーemail

    const user = UserEntity.of(userId, email, new Date(), new Date());

    return await this.userRepository.upsert(user);
  }
}
