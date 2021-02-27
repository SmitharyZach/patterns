"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addConstraint("patterns", {
      fields: ["user_id"],
      type: "foreign key",
      name: "custom_fkey_user_id",
      references: {
        table: "users",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    await queryInterface.addConstraint("scores", {
      fields: ["pattern_id"],
      type: "foreign key",
      name: "custom_fkey_pattern_id",
      references: {
        table: "patterns",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeConstraint("patterns", "custom_fkey_user_id");
    await queryInterface.removeConstraint("scores", "custom_fkey_pattern_id");
  },
};
