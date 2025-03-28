/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
import { QueryTypes } from "sequelize";
import * as _ from "lodash";
import sequelize from "../../database";

export interface DashboardData {
  tickets: any[];
  totalTickets: any;
}

export interface Params {
  searchParam: string;
  contactId: string;
  whatsappId: string[];
  dateFrom: string;
  dateTo: string;
  status: string[];
  queueIds: number[];
  tags: number[];
  users: number[];
  userId: string;
}

export default async function ListTicketsServiceReport(
  companyId: string | number,
  params: Params,
  page: number = 1,
  pageSize: number = 20
): Promise<DashboardData> {
  const offset = (page - 1) * pageSize;

  const query = `
SELECT DISTINCT ON ("Tickets".id)
    "Tickets".id, 
    "Whatsapps".name AS "whatsappName",
    "Contacts".name AS "contactName",
    "Users".name AS "userName", 
    "Queues".name AS "queueName",
    "Tickets"."lastMessage",
    "Tickets"."uuid",
    "Tickets"."status",
    TO_CHAR("TicketTraking"."createdAt", 'DD/MM/YYYY HH24:MI') AS "createdAt",
    TO_CHAR("TicketTraking"."finishedAt", 'DD/MM/YYYY HH24:MI') AS "closedAt",
    "UserRatings".rate AS "NPS",
    CASE 
        WHEN "TicketTraking"."finishedAt" IS NOT NULL THEN
            CONCAT(
                EXTRACT(DAY FROM AGE("TicketTraking"."finishedAt", "TicketTraking"."createdAt")), ' d, ',
                EXTRACT(HOUR FROM AGE("TicketTraking"."finishedAt", "TicketTraking"."createdAt")), ' hrs, ',
                EXTRACT(MINUTE FROM AGE("TicketTraking"."finishedAt", "TicketTraking"."createdAt")), ' m'
            )
        ELSE
            CONCAT(
                EXTRACT(DAY FROM AGE(NOW(), "TicketTraking"."createdAt")), ' d, ',
                EXTRACT(HOUR FROM AGE(NOW(), "TicketTraking"."createdAt")), ' hrs, ',
                EXTRACT(MINUTE FROM AGE(NOW(), "TicketTraking"."createdAt")), ' m'
            )
    END AS "supportTime"
FROM "Tickets"
INNER JOIN "TicketTraking" ON "TicketTraking"."ticketId" = "Tickets".id
LEFT JOIN "Whatsapps" ON "Whatsapps".id = "TicketTraking"."whatsappId"
LEFT JOIN "Users" ON "Users".id = "TicketTraking"."userId"
INNER JOIN "Contacts" ON "Contacts".id = "Tickets"."contactId"
LEFT JOIN "Queues" ON "Queues".id = "Tickets"."queueId"
LEFT JOIN "UserRatings" ON "UserRatings"."ticketTrakingId" = "TicketTraking".id`;

  let where = `WHERE "Tickets"."companyId" = ${companyId}`;

  if (_.has(params, "dateFrom")) {
    where += ` AND "TicketTraking"."createdAt" >= '${params.dateFrom} 00:00:00'`;
  }

  if (_.has(params, "dateTo")) {
    where += ` AND "TicketTraking"."createdAt" <= '${params.dateTo} 23:59:59'`;
  }

  if (params.whatsappId !== undefined && params.whatsappId.length > 0) {
    where += ` AND "TicketTraking"."whatsappId" IN (${params.whatsappId})`;
  }

  if (params.users.length > 0) {
    where += ` AND "TicketTraking"."userId" IN (${params.users})`;
  }

  if (params.queueIds.length > 0) {
    where += ` AND COALESCE("Tickets"."queueId", 0) IN (${params.queueIds})`;
  }

  if (params.status.length > 0) {
    where += ` AND "Tickets"."status" IN ('${params.status.join("','")}')`;
  }

  if (params.contactId !== undefined && params.contactId !== "") {
    where += ` AND "Tickets"."contactId" = ${params.contactId}`;
  }

  const finalQuery = `${query} ${where}`;

  const totalTicketsQuery = `
    SELECT COUNT(DISTINCT "Tickets".id) AS total
    FROM "Tickets"
    INNER JOIN "TicketTraking" ON "TicketTraking"."ticketId" = "Tickets".id
    ${where}
  `;

  const totalTicketsResult = await sequelize.query(totalTicketsQuery, {
    type: QueryTypes.SELECT,
  });
  const totalTickets = totalTicketsResult[0];

  const paginatedQuery = `${finalQuery} ORDER BY "Tickets".id, "TicketTraking"."createdAt" DESC LIMIT ${pageSize} OFFSET ${offset}`;

  const responseData: any[] = await sequelize.query(paginatedQuery, {
    type: QueryTypes.SELECT,
  });

  return { tickets: responseData, totalTickets };
}

