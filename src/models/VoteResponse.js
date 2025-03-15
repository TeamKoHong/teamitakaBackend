//어떤 옵션을 선택했는지 저장장
module.exports = (sequelize) => {
    const VoteResponse = sequelize.define(
      'VoteResponse',
      {
        response_id: {
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
        option_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'VoteOptions',
            key: 'option_id',
          },
          onDelete: 'CASCADE',
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'Users',
            key: 'user_id',
          },
          onDelete: 'CASCADE',
        },
      },
      {
        tableName: 'VoteResponses',
        freezeTableName: true,
        timestamps: true,
      }
    );
  
    return VoteResponse;
  };