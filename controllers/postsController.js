const pool = require("../model/db");

// ПОЛУЧИТЬ ВСЕ ПОСТЫ
exports.getAllPosts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pid, user_id, title, description, hashtags, image_url, views_count, likes_count, comments_count, created_at, updated_at
       FROM posts`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ПОЛУЧИТЬ ПОСТ ПО АЙДИ
exports.getPostById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT pid, user_id, title, description, hashtags, image_url, views_count, likes_count, comments_count, created_at, updated_at 
       FROM posts 
       WHERE pid = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ДОБАВЛЕНИЕ ПОСТА
exports.addPost = async (req, res) => {
  const { user_id } = req.user; // юзер из миддлвейра
  const { title, description, hashtags, image_url } = req.body;

  try {
    const newPost = await pool.query(
      `INSERT INTO posts (user_id, title, description, hashtags, image_url, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *`,
      [user_id, title, description, hashtags, image_url]
    );
    res.status(201).json(newPost.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ИЗМЕНЕНИЕ ПОСТА
exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags, image_url } = req.body;
  const { user_id, is_admin } = req.user;

  try {
    const postResult = await pool.query("SELECT * FROM posts WHERE pid = $1", [id]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const post = postResult.rows[0];

    if (post.user_id !== user_id && !is_admin) {
      return res.status(403).json({ message: "Access denied: Only the owner or an admin can update this post" });
    }

    const updatedPost = await pool.query(
      `UPDATE posts 
        SET title = $1, description = $2, hashtags = $3, image_url = $4, updated_at = NOW() 
        WHERE pid = $5 
        RETURNING *`,
      [title, description, hashtags, image_url, id]
    );

    res.json(updatedPost.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// УДАЛЕНИЕ
exports.deletePost = async (req, res) => {
  const { id } = req.params;
  const { user_id, is_admin } = req.user;

  try {
    const postResult = await pool.query("SELECT * FROM posts WHERE pid = $1", [id]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const post = postResult.rows[0];

    if (post.user_id !== user_id && !is_admin) {
      return res.status(403).json({ message: "Access denied: Only the owner or an admin can delete this post" });
    }

    await pool.query("DELETE FROM posts WHERE pid = $1", [id]);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ЛАЙКИ

exports.likePost = async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.user;

  try {
    // ПРОВЕРИТЬ НАЖАЛ ЛИ ПОЛЬЗОВАТЕЛЬ НА ЛАЙК
    const likeCheck = await pool.query(
      `SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2`,
      [id, user_id]
    );

    if (likeCheck.rows.length > 0) {
      // ДИЗЛАЙК ПОСТА
      await pool.query(
        `DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2`,
        [id, user_id]
      );
      await pool.query(
        `UPDATE posts SET likes_count = likes_count - 1 WHERE pid = $1`,
        [id]
      );
      return res.json({ message: "Post unliked" });
    }

    // ЛАЙКНУТЬ ПОСТ
    await pool.query(
      `INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)`,
      [id, user_id]
    );
    await pool.query(
      `UPDATE posts SET likes_count = likes_count + 1 WHERE pid = $1`,
      [id]
    );
    res.json({ message: "Post liked" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// КОММЕНТЫ


// ПОЛУЧИТЬ ВСЕ КОММЕНТЫ КОТОРЫЕ НАХОДЯТСЯ ПОД ПОСТОМ ПО АЙДИ ДАННОГО ПОСТА
exports.getAllCommentPost = async (req, res) => {
  const { id } = req.params; // post_id
  try {
    const result = await pool.query(
      `SELECT * FROM post_comments WHERE post_id = $1`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ДОБАВИТЬ КОММЕНТ ПОД ПОСТОМ
exports.addComment = async (req, res) => {
  const { id } = req.params; // post_id
  const { user_id } = req.user;
  const { content } = req.body;

  try {
    const newComment = await pool.query(
      `INSERT INTO post_comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *`,
      [id, user_id, content]
    );

    await pool.query(
      `UPDATE posts SET comments_count = comments_count + 1 WHERE pid = $1`,
      [id]
    );

    res.status(201).json(newComment.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// УДАЛИТЬ КОММЕНТ ПОД ПОСТОМ
exports.deleteComment = async (req, res) => {
  const { id, commentId } = req.params;
  const { user_id } = req.user;

  try {
    // ПРОВЕРИТЬ ЕГО ЛИ КОММЕНТ
    const comment = await pool.query(
      `SELECT * FROM post_comments WHERE post_id = $1 AND comment_id = $2`,
      [id, commentId]
    );

    if (comment.rows.length === 0) { // ЕСЛИ КОММЕНТОВ НЕТ, ТО ОН ПРОСТО ВЕРНЁТ И СКАЖЕТ ЧТО НЕТ КОММЕНТОВ 
      return res.status(404).json({ message: "Comment not found" });
    } else if (comment.rows[0].user_id !== user_id) { // ТОЛЬКО ОН МОЖЕТ УДАЛИТЬ СВОИ КОММЕНТЫ
      return res.status(403).json({ message: "Access denied: You can only delete your own comments" });
    }

    // УДАЛИТЬ КОММЕНТАРИЙ
    await pool.query(
      `DELETE FROM post_comments WHERE comment_id = $1`,
      [commentId]
    );

    // Update the comments count in the post
    await pool.query(
      `UPDATE posts SET comments_count = comments_count - 1 WHERE pid = $1`,
      [id]
    );

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ПРОСМОТРЫ
exports.viewPost = async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.user || null; // ПОЛУЧИТЬ ЮЗЕР АЙДИ, ЕСЛИ НЕТ ЮЗЕРА (ТО ЕСТЬ ОБЫЧНЫЙ НЕАВТОРИЗОВАННЫЙ), ТО БУДЕТ НАЛЛ

  try {
    // Счётчик для обновления чисел для вью
    await pool.query(
      `UPDATE posts 
       SET views_count = views_count + 1 
       WHERE id = $1 
       RETURNING views_count`,
      [id]
    );

    // Чекнуть кто посмотрел пост, это может быть и значение налл, либо тот кто регался 
    await pool.query(
      `INSERT INTO post_views (post_id, user_id) 
       VALUES ($1, $2) 
       ON CONFLICT DO NOTHING`,
      [id, user_id]
    );

    res.json({ message: "View recorded successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
