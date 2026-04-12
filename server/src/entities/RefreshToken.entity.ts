import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../entities/User.entity";

@Entity()
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    sessionId: string;

    @Column({ unique: true })
    token: string;

    @Column({ nullable: true })
    deviceName: string;

    @Column({ nullable: true })
    browser: string;

    @Column({ nullable: true })
    os: string;

    @Column({ nullable: true })
    userAgent: string;

    @Column({ nullable: true })
    ipAddress: string;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    lastUsedAt: Date;

    @Column({ type: "datetime" })
    expiresAt: Date;

    @Column({ type: "datetime", nullable: true })
    revokedAt: Date | null;

    @ManyToOne(()=> User, (user)=> user.refreshTokens)
    user: User;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
