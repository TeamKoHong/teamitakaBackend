// ✅ 모집공고 임시저장 전용 API
router.post("/recruitment/draft", authMiddleware, async (req, res) => {
    try {
      const { title, description, start_date, end_date, hashtags } = req.body;
      const user_id = res.locals.user.user_id;
  
      const draftRecruitment = await Recruitment.create({
        title,
        description,
        status: "임시저장",
        start_date,
        end_date,
        user_id,
        is_draft: true,
      });
  
      if (hashtags && hashtags.length > 0) {
        const hashtagPromises = hashtags.map(async (tag) => {
          const [hashtag] = await Hashtag.findOrCreate({ where: { content: tag } });
          return hashtag;
        });
  
        const hashtagResults = await Promise.all(hashtagPromises);
        await draftRecruitment.addHashtags(hashtagResults);
      }
  
      res.status(201).json({ message: "임시저장되었습니다.", draftRecruitment });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  });
  