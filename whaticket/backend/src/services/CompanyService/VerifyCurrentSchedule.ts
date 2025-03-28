import { QueryTypes } from "sequelize";
import sequelize from "../../database";

type Result = {
  id: number;
  currentSchedule: [];
  startTime: string;
  endTime: string;
  lunchTime: string;
  afterLunchTime: string;
  inActivity: boolean;
};

const VerifyCurrentSchedule = async (id: string | number): Promise<Result> => {
  const sql = `
    SELECT
      s.id,
      s.currentWeekday,
      s.currentSchedule,
      (s.currentSchedule->>'startTime')::time "startTime",
      (s.currentSchedule->>'endTime')::time "endTime",
      (s.currentSchedule->>'lunchTime')::time "lunchTime",
      (s.currentSchedule->>'afterLunchTime')::time "afterLunchTime",
      (
        now()::time >= (s.currentSchedule->>'startTime')::time AND
        now()::time <= (s.currentSchedule->>'endTime')::time AND
        NOT (
          now()::time >= (s.currentSchedule->>'lunchTime')::time AND
          now()::time < (s.currentSchedule->>'afterLunchTime')::time
        )
      ) AS "inActivity"
    FROM (
      SELECT
        c.id,
        to_char(current_date, 'day') AS currentWeekday,
        (array_to_json(array_agg(s)) ->> 0)::jsonb AS currentSchedule
      FROM "Companies" c, jsonb_array_elements(c.schedules) s
      WHERE s->>'weekdayEn' LIKE TRIM(to_char(current_date, 'day')) 
        AND c.id = :id
      GROUP BY c.id, currentWeekday
    ) s
    WHERE s.currentSchedule->>'startTime' NOT LIKE '' 
      AND s.currentSchedule->>'endTime' NOT LIKE '';
  `;

  const result: Result = await sequelize.query(sql, {
    replacements: { id },
    type: QueryTypes.SELECT,
    plain: true
  });

  return result;
};

export default VerifyCurrentSchedule;
