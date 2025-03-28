import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'contactid_companyid_unique'
        ) THEN
          ALTER TABLE "Tickets" ADD CONSTRAINT contactid_companyid_unique UNIQUE ("contactId", "companyId");
        END IF;
      END $$;
    `);
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeConstraint(
      "Tickets",
      "contactid_companyid_unique"
    );
  }
};
