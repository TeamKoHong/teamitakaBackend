//투표 선택지
module.exports = (sequelize) => {
    const VoteOption = sequelize.define(
      'VoteOption',
      {
        option_id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        vote_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'Votes',
            key: 'vote_id',
          },
          onDelete: 'CASCADE',
        },
        option_text: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        tableName: 'VoteOptions',
        freezeTableName: true,
        timestamps: false,
      }
    );
  
    return VoteOption;
  };