import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  DataType
} from "sequelize-typescript";
import Company from "./Company";

@Table
class Task extends Model<Task> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  text: string;

  @Column(DataType.TEXT)
  description: string;

  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  completed: boolean;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;
}

export default Task;
