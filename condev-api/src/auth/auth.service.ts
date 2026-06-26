import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { UsersService } from '../users/users.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto) {
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException('確認用パスワードが一致しません')
    }

    if (!registerDto.agreeTerms) {
      throw new BadRequestException('利用規約への同意が必要です')
    }

    const exists = await this.usersService.findByEmail(registerDto.email)
    if (exists) {
      throw new ConflictException('このメールアドレスはすでに登録されています')
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10)
    const user = await this.usersService.create({
      companyName: registerDto.companyName,
      userName: registerDto.userName,
      email: registerDto.email,
      passwordHash
    })

    return {
      user: this.toAuthUser(user),
      accessToken: this.signAccessToken(user.id, user.email)
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email)
    if (!user) {
      throw new UnauthorizedException('メールアドレスまたはパスワードが正しくありません')
    }

    const passwordMatched = await bcrypt.compare(loginDto.password, user.passwordHash)
    if (!passwordMatched) {
      throw new UnauthorizedException('メールアドレスまたはパスワードが正しくありません')
    }

    return {
      user: this.toAuthUser(user),
      accessToken: this.signAccessToken(user.id, user.email)
    }
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId)
    if (!user) {
      throw new UnauthorizedException('ユーザーが見つかりません')
    }

    return this.toAuthUser(user)
  }

  private signAccessToken(userId: string, email: string) {
    return this.jwtService.sign({
      sub: userId,
      email
    })
  }

  private toAuthUser(user: { id: string; companyName: string; userName: string; email: string }) {
    return {
      id: user.id,
      companyName: user.companyName,
      userName: user.userName,
      email: user.email
    }
  }
}
