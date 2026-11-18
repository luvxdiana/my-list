const pool = require("../db");

async function loadCompassCatalog() {
  const query = `
    SELECT
      media.id,
      media.tmdb_id,
      media.title,
      media.category,
      media.release_year,
      media.duration_minutes,
      ARRAY(
        SELECT genres.name
        FROM public.media_genres AS mg
        JOIN public.genres AS genres
          ON genres.id = mg.genre_id
        WHERE mg.media_id = media.id
        ORDER BY genres.name
      ) AS genres,
      ARRAY(
        SELECT emotions.code
        FROM public.media_emotions AS me
        JOIN public.emotions AS emotions
          ON emotions.id = me.emotion_id
        WHERE me.media_id = media.id
        ORDER BY emotions.code
      ) AS emotions
    FROM public.media_catalog AS media
    WHERE media.category IN ('movie', 'series')
      AND EXISTS (
        SELECT 1
        FROM public.media_emotions AS annotated
        WHERE annotated.media_id = media.id
          AND annotated.annotation_status IN ('provisional', 'reviewed')
      )
    ORDER BY media.id;
  `;

  const result = await pool.query(query);
  return result.rows;
}

module.exports = { loadCompassCatalog };
