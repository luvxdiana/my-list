// Translations

(function () {
  "use strict";

  const STORAGE_KEY = "mylist-language";
  const DEFAULT_LANGUAGE = "uk";
  const translations = {
    uk: {
      "language.label": "Мова інтерфейсу",
      "auth.pageTitle": "My List | Вхід",
      "auth.loginTitle": "УВІЙТИ",
      "auth.registerTitle": "РЕЄСТРАЦІЯ",
      "auth.email": "Електронна пошта",
      "auth.username": "Ім’я користувача",
      "auth.password": "Пароль",
      "auth.confirmPassword": "Підтвердіть пароль",
      "auth.loginButton": "УВІЙТИ",
      "auth.registerButton": "ЗАРЕЄСТРУВАТИСЯ",
      "auth.noAccount": "Немає облікового запису?",
      "auth.haveAccount": "Уже маєте обліковий запис?",
      "auth.registerLink": "Реєстрація",
      "auth.loginLink": "Увійти",
      "auth.loginFailed": "Не вдалося увійти.",
      "auth.registerFailed": "Не вдалося зареєструватися.",
      "auth.noServer": "Не вдалося з’єднатися із сервером.",
      "auth.passwordMismatch": "Паролі не збігаються!",
      "auth.welcome": "Вітаємо, {username}!",
      "auth.created": "Обліковий запис створено! Тепер можна увійти.",
      "auth.invalidCredentials": "Неправильна електронна пошта або пароль.",
      "auth.emailExists": "Ця електронна пошта вже використовується.",
    },
    en: {
      "language.label": "Interface language",
      "auth.pageTitle": "My List | Login",
      "auth.loginTitle": "LOG IN",
      "auth.registerTitle": "REGISTER",
      "auth.email": "E-mail",
      "auth.username": "Username",
      "auth.password": "Password",
      "auth.confirmPassword": "Confirm password",
      "auth.loginButton": "LOGIN",
      "auth.registerButton": "REGISTER",
      "auth.noAccount": "Don't have an account?",
      "auth.haveAccount": "Already have an account?",
      "auth.registerLink": "Register",
      "auth.loginLink": "Log in",
      "auth.loginFailed": "Login failed.",
      "auth.registerFailed": "Registration failed.",
      "auth.noServer": "Cannot connect to server.",
      "auth.passwordMismatch": "Passwords do not match!",
      "auth.welcome": "Welcome, {username}!",
      "auth.created": "Account created! You can now log in.",
      "auth.invalidCredentials": "Incorrect email or password.",
      "auth.emailExists": "This email is already in use.",
    },
  };

  // Library and Compass translations
  Object.assign(translations.uk, {
    "dashboard.pageTitle": "My List | Моя бібліотека",
    "dashboard.attr.media_categories": "Категорії медіа",
    "dashboard.attr.log_out": "Вийти",
    "dashboard.attr.library_controls": "Керування бібліотекою",
    "dashboard.attr.search_anime_in_my_list": "Шукати аніме у списку...",
    "dashboard.attr.search_my_list": "Пошук у моєму списку",
    "dashboard.attr.my_entries": "Мої записи",
    "dashboard.attr.open_mylist_compass": "Відкрити MyList Compass",
    "dashboard.attr.close_compass": "Закрити Compass",
    "dashboard.attr.add_new_entry": "Додати запис",
    "dashboard.attr.close": "Закрити",
    "dashboard.attr.selected_cover": "Вибрана обкладинка",
    "dashboard.attr.name": "Назва",
    "dashboard.attr.available_genres": "Доступні жанри",
    "dashboard.attr.rating_from_0_5_to_5_stars": "Оцінка від 0,5 до 5 зірок",
    "dashboard.html.my_anime_list": "МОЄ АНІМЕ",
    "dashboard.html.my_series_list": "МОЇ СЕРІАЛИ",
    "dashboard.html.my_movie_list": "МОЇ ФІЛЬМИ",
    "dashboard.html.my_reading_list": "МОЇ КНИГИ",
    "dashboard.html.my_game_list": "МОЇ ІГРИ",
    "dashboard.html.total_anime": "УСЬОГО АНІМЕ",
    "dashboard.html.average_rating": "СЕРЕДНЯ ОЦІНКА",
    "dashboard.html.all_0": "УСІ (0)",
    "dashboard.html.completed_0": "ЗАВЕРШЕНО (0)",
    "dashboard.html.incomplete_0": "НЕ ЗАВЕРШЕНО (0)",
    "dashboard.html.dropped_0": "ПОКИНУТО (0)",
    "dashboard.html.add_new": "ДОДАТИ",
    "dashboard.html.your_personal_guide": "ТВІЙ ОСОБИСТИЙ ПОМІЧНИК",
    "dashboard.html.tell_us_how_you_feel_and_let_your_compass_guide_you_toward_your_next_story":
      "Розкажи, як ти почуваєшся, і нехай Compass допоможе обрати наступну історію.",
    "dashboard.html.how_are_you_feeling_right_now": "Як ти зараз почуваєшся?",
    "dashboard.html.happy": "😊 Радісно",
    "dashboard.html.sad": "😢 Сумно",
    "dashboard.html.anxious": "😰 Тривожно",
    "dashboard.html.calm": "😌 Спокійно",
    "dashboard.html.tired": "😴 Втомлено",
    "dashboard.html.excited": "🤩 Захоплено",
    "dashboard.html.how_would_you_like_to_feel": "Що ти хочеш відчути?",
    "dashboard.html.joy": "✨ Радість",
    "dashboard.html.comfort": "💜 Затишок",
    "dashboard.html.peace": "🌙 Спокій",
    "dashboard.html.inspiration": "🌟 Натхнення",
    "dashboard.html.excitement": "⚡ Хвилювання",
    "dashboard.html.energy": "🔥 Енергія",
    "dashboard.html.how_much_time_do_you_have": "Скільки часу в тебе є?",
    "dashboard.html.30_min": "30 хв",
    "dashboard.html.1_hour": "1 година",
    "dashboard.html.1_5_hours": "1,5 години",
    "dashboard.html.2_hours": "2 години",
    "dashboard.html.no_time_limit": "Без обмежень",
    "dashboard.html.what_would_you_like_to_watch": "Що хочеш подивитися?",
    "dashboard.html.movie": "🎬 Фільм",
    "dashboard.html.series": "📺 Серіал",
    "dashboard.html.surprise_me": "💫 Здивуй мене",
    "dashboard.html.save_this_compass_search": "Зберегти цей пошук Compass",
    "dashboard.html.save_your_selected_mood_desired_emotion_time_content_type_and_recommended_titles_to_y":
      "Збережи обраний настрій, бажану емоцію, час, тип контенту й рекомендовані назви у своєму профілі.",
    "dashboard.html.search": "ШУКАТИ",
    "dashboard.html.your_compass_search_is_not_saved_unless_you_choose_to_save_it":
      "Пошук Compass не зберігається, якщо ти самостійно не вибереш цю опцію.",
    "dashboard.html.your_compass_request": "Твій запит до Compass ✦",
    "dashboard.html.personalized_recommendations_will_appear_here_when_the_recommendation_engine_is_conne":
      "Тут з’являться персональні рекомендації.",
    "dashboard.html.add_photo": "ДОДАТИ ФОТО",
    "dashboard.html.remove_photo": "ПРИБРАТИ ФОТО",
    "dashboard.html.genres": "Жанри:",
    "dashboard.html.select_genres": "Обери жанри...",
    "dashboard.html.loading_genres": "Завантаження жанрів...",
    "dashboard.html.total_episodes": "Усього епізодів:",
    "dashboard.html.status": "Статус:",
    "dashboard.html.incomplete": "НЕ ЗАВЕРШЕНО",
    "dashboard.html.completed": "ЗАВЕРШЕНО",
    "dashboard.html.dropped": "ПОКИНУТО",
    "dashboard.html.description": "Опис:",
    "dashboard.html.my_review": "Мій відгук:",
    "dashboard.html.text": "Текст:",
    "dashboard.html.delete": "ВИДАЛИТИ",
    "dashboard.html.save": "ЗБЕРЕГТИ",
    "dashboard.category.anime.title": "МОЄ АНІМЕ",
    "dashboard.category.anime.total": "УСЬОГО АНІМЕ",
    "dashboard.category.anime.search": "Шукати аніме у списку...",
    "dashboard.category.anime.length": "Усього епізодів:",
    "dashboard.category.series.title": "МОЇ СЕРІАЛИ",
    "dashboard.category.series.total": "УСЬОГО СЕРІАЛІВ",
    "dashboard.category.series.search": "Шукати серіали у списку...",
    "dashboard.category.series.length": "Усього епізодів:",
    "dashboard.category.movie.title": "МОЇ ФІЛЬМИ",
    "dashboard.category.movie.total": "УСЬОГО ФІЛЬМІВ",
    "dashboard.category.movie.search": "Шукати фільми у списку...",
    "dashboard.category.movie.length": "Тривалість (хвилини):",
    "dashboard.category.book.title": "МОЇ КНИГИ",
    "dashboard.category.book.total": "УСЬОГО КНИГ",
    "dashboard.category.book.search": "Шукати книги у списку...",
    "dashboard.category.book.length": "Усього сторінок:",
    "dashboard.category.game.title": "МОЇ ІГРИ",
    "dashboard.category.game.total": "УСЬОГО ІГОР",
    "dashboard.category.game.search": "Шукати ігри у списку...",
    "dashboard.category.game.length": "Час гри (години):",
    "dashboard.genres.select": "Обери жанри...",
    "dashboard.genres.legacy":
      "Раніше введені жанри збережуться, доки ти не зміниш вибір.",
    "dashboard.genres.loadError": "Не вдалося завантажити жанри.",
    "dashboard.genres.invalidResponse":
      "Неправильна відповідь сервера щодо жанрів.",
    "dashboard.genres.unavailable":
      "Жанри недоступні. Спробуй оновити сторінку.",
    "dashboard.logout.error": "Не вдалося вийти.",
    "dashboard.photo.format":
      "Обери зображення PNG, JPG, WEBP або GIF до 5 МБ.",
    "dashboard.photo.preview": "Не вдалося переглянути фото.",
    "dashboard.save": "ЗБЕРЕГТИ",
    "dashboard.saveChanges": "ЗБЕРЕГТИ ЗМІНИ",
    "dashboard.addEntry": "Додати запис",
    "dashboard.noCover": "НЕМАЄ ОБКЛАДИНКИ",
    "dashboard.myReview": "Мій відгук:",
    "dashboard.status.all": "УСІ",
    "dashboard.status.completed": "ЗАВЕРШЕНО",
    "dashboard.status.incomplete": "НЕ ЗАВЕРШЕНО",
    "dashboard.status.dropped": "ПОКИНУТО",
    "dashboard.genres.tooLong": "Обрані жанри перевищують 100 символів.",
    "dashboard.saving": "ЗБЕРЕЖЕННЯ...",
    "dashboard.entry.saveError": "Не вдалося зберегти запис.",
    "dashboard.photo.uploading": "ЗАВАНТАЖЕННЯ ФОТО...",
    "dashboard.photo.uploadError": "Не вдалося завантажити фото.",
    "dashboard.photo.removing": "ВИДАЛЕННЯ ФОТО...",
    "dashboard.photo.removeError": "Не вдалося видалити фото.",
    "dashboard.entry.updated": "Запис успішно оновлено.",
    "dashboard.entry.saved": "Запис успішно збережено.",
    "dashboard.entry.refreshFailed":
      "Запис збережено, але оновити бібліотеку не вдалося.",
    "dashboard.entry.deleteConfirm": "Назавжди видалити цей запис?",
    "dashboard.entry.deleteError": "Не вдалося видалити запис.",
    "dashboard.entry.deleted": "Запис успішно видалено.",
    "dashboard.entry.deleteRefreshFailed":
      "Запис видалено, але бібліотеку не вдалося оновити.",
    "dashboard.entry.loadError": "Не вдалося завантажити записи.",
    "dashboard.genres.count": "Обрано {count}/{max} · До {limit} символів",
    "dashboard.ratingStars": "Оцінити на {number} зірок",
    "dashboard.editEntry": "Редагувати: {title}",
    "dashboard.openEntry": "Відкрити: {title}",
    "dashboard.entry.photoFailed":
      "Запис збережено, але змінити фото не вдалося: {message}",
    "compass.label.current_mood.happy": "Радісно",
    "compass.label.current_mood.sad": "Сумно",
    "compass.label.current_mood.anxious": "Тривожно",
    "compass.label.current_mood.calm": "Спокійно",
    "compass.label.current_mood.tired": "Втомлено",
    "compass.label.current_mood.excited": "Захоплено",
    "compass.label.desired_emotion.joy": "Радість",
    "compass.label.desired_emotion.comfort": "Затишок",
    "compass.label.desired_emotion.calm": "Спокій",
    "compass.label.desired_emotion.inspiration": "Натхнення",
    "compass.label.desired_emotion.thrill": "Хвилювання",
    "compass.label.desired_emotion.energy": "Енергія",
    "compass.label.available_time.30": "30 хвилин",
    "compass.label.available_time.60": "1 година",
    "compass.label.available_time.90": "1,5 години",
    "compass.label.available_time.120": "2 години",
    "compass.label.content_type.movie": "Фільм",
    "compass.label.content_type.series": "Серіал",
    "compass.label.content_type.either": "Фільм або серіал",
    "compass.history.deleteConfirm":
      "Видалити збережений пошук Compass? Усі рекомендації та відгуки також буде видалено. Це неможливо скасувати.",
    "compass.history.empty":
      "Поки немає збережених пошуків. Ти можеш користуватися Compass без збереження.",
    "compass.suggest.limited":
      "У поточному каталозі ще замало емоційних позначок для такого запиту.",
    "compass.status.partialC":
      "Ми не додаватимемо невідповідні назви лише для кількості.",
    "compass.suggest.timeA":
      "Довший час може допомогти, але додаткові емоційні ",
    "compass.suggest.bothA": "Спробуй «Фільм або серіал» чи довший час, ",
    "compass.suggest.typeA": "Вибір фільмів і серіалів розширює пошук, ",
    "compass.history.unavailableB":
      "«Зберегти цей пошук Compass», щоб продовжити без збереження.",
    "compass.status.completeA":
      "Ми знайшли 3 назви відповідно до твого запиту ",
    "compass.suggest.bothB": "але це не гарантує нових збігів.",
    "compass.history.noMatches":
      "Для цього пошуку не знайдено відповідних назв.",
    "compass.suggest.moreA": "Нові рекомендації можуть з’явитися після ",
    "compass.status.partialA": "Це доступні результати для вибраної ",
    "compass.suggest.moreB": "перевірки додаткових емоційних позначок.",
    "compass.session.expired": "Твоя сесія завершилася. Увійди знову.",
    "compass.status.emptyA": "Не знайшлося назви з вибраною ",
    "compass.status.emptyB":
      "емоційною позначкою, яка відповідає типу контенту ",
    "compass.history.unavailableA":
      "Збереження історії поки недоступне. Зніми позначку ",
    "compass.suggest.typeB": "але може не дати більше рекомендацій.",
    "compass.search.waitMessage": "Compass досліджує каталог...",
    "compass.status.partialB": "емоції, типу контенту та часу. ",
    "compass.feedback.rateTitle": "Оціни рекомендацію після перегляду",
    "compass.feedback.note": "Необов’язковий коментар до рекомендації",
    "compass.feedback.fitRequired":
      "Спочатку обери оцінку емоційної відповідності.",
    "compass.recommendations.error": "Не вдалося створити рекомендації.",
    "compass.history.deleteError": "Не вдалося видалити збережений пошук.",
    "compass.history.loadError": "Не вдалося завантажити збережені пошуки.",
    "compass.validation.all":
      "Будь ласка, дай відповідь на всі чотири запитання.",
    "compass.feedback.achieved": "Чи відчув(-ла) ти бажану емоцію?",
    "compass.suggest.timeB": "позначки все одно можуть бути потрібні.",
    "compass.status.completeB": "на основі позначок поточного каталогу.",
    "compass.results.heading": "Рекомендації твого Compass ✦",
    "compass.history.loading": "Завантаження збережених пошуків...",
    "compass.feedback.saveError": "Не вдалося зберегти відгук.",
    "compass.feedback.editTitle": "Твій відгук · Можна редагувати",
    "compass.feedback.saved": "Відгук успішно збережено.",
    "compass.status.two": "Знайдено 2 рекомендації ✦",
    "compass.status.ready": "Твої результати готові ✦",
    "compass.status.one": "Знайдено 1 рекомендацію ✦",
    "compass.history.view": "ПЕРЕГЛЯНУТИ ЗБЕРЕЖЕНІ ПОШУКИ ✦",
    "compass.history.hide": "СХОВАТИ ЗБЕРЕЖЕНІ ПОШУКИ ✦",
    "compass.feedback.fit": "Відповідність емоції (обов’язково)",
    "compass.feedback.rating": "Оцінка назви (необов’язково)",
    "compass.search.waitTitle": "Шукаємо твої рекомендації ✦",
    "compass.status.empty": "Поки немає збігів ✦",
    "compass.status.emptyC": "та обраному часу.",
    "compass.error.title": "Сталася помилка",
    "compass.feedback.comment": "Коментар (необов’язково)",
    "compass.history.delete": "ВИДАЛИТИ ЦЕЙ ПОШУК",
    "compass.error.retry": "Спробуй ще раз.",
    "compass.feedback.noAnswer": "Не хочу відповідати",
    "compass.history.dateError": "Дата недоступна",
    "compass.feedback.update": "ОНОВИТИ ВІДГУК",
    "compass.validation.title": "Майже готово!",
    "compass.feedback.save": "ЗБЕРЕГТИ ВІДГУК",
    "compass.searching": "ПОШУК...",
    "compass.history.deleting": "ВИДАЛЕННЯ...",
    "compass.feedback.selectRating": "Обери 1–5",
    "compass.feedback.notRated": "Без оцінки",
    "compass.feedback.saving": "ЗБЕРЕЖЕННЯ...",
    "compass.feedback.yes": "Так",
    "compass.feedback.no": "Ні",
    "compass.durationEpisode": "{minutes} хв/епізод",
    "compass.durationMinutes": "{minutes} хв",
    "compass.genres": "Жанри: {genres}",
    "compass.score": "Прототипна оцінка відповідності: {score} / 1,00",
    "compass.scoreUnavailable": "Прототипна оцінка відповідності недоступна",
    "compass.researchNote":
      "Це попередні рекомендації на основі технічних емоційних позначок. Оцінки відповідності є евристичними та ще не перевірені незалежним дослідженням користувачів.",
    "compass.history.score": " · оцінка {score}",
    "compass.history.emotionalFit": " · емоційна відповідність {fit}/5",
    "genre.Action": "Бойовик",
    "genre.Adventure": "Пригоди",
    "genre.Animation": "Анімація",
    "genre.Comedy": "Комедія",
    "genre.Crime": "Кримінал",
    "genre.Documentary": "Документальне",
    "genre.Drama": "Драма",
    "genre.Family": "Сімейне",
    "genre.Fantasy": "Фентезі",
    "genre.History": "Історичне",
    "genre.Horror": "Жахи",
    "genre.Music": "Музика",
    "genre.Mystery": "Детектив",
    "genre.Romance": "Романтика",
    "genre.Science Fiction": "Наукова фантастика",
    "genre.Sci-Fi & Fantasy": "Фантастика та фентезі",
    "genre.Thriller": "Трилер",
    "genre.TV Movie": "Телефільм",
    "genre.War": "Військове",
    "genre.Western": "Вестерн",
    "genre.Action & Adventure": "Бойовик і пригоди",
    "genre.Kids": "Для дітей",
    "genre.News": "Новини",
    "genre.Reality": "Реаліті",
    "genre.Soap": "Мильна опера",
    "genre.Talk": "Токшоу",
    "genre.War & Politics": "Війна і політика",
  });
  Object.assign(translations.en, {
    "dashboard.pageTitle": "My List | My Library",
    "dashboard.attr.media_categories": "Media categories",
    "dashboard.attr.log_out": "Log out",
    "dashboard.attr.library_controls": "Library controls",
    "dashboard.attr.search_anime_in_my_list": "Search anime in my list...",
    "dashboard.attr.search_my_list": "Search my list",
    "dashboard.attr.my_entries": "My entries",
    "dashboard.attr.open_mylist_compass": "Open MyList Compass",
    "dashboard.attr.close_compass": "Close Compass",
    "dashboard.attr.add_new_entry": "Add new entry",
    "dashboard.attr.close": "Close",
    "dashboard.attr.selected_cover": "Selected cover",
    "dashboard.attr.name": "Name",
    "dashboard.attr.available_genres": "Available genres",
    "dashboard.attr.rating_from_0_5_to_5_stars": "Rating from 0.5 to 5 stars",
    "dashboard.html.my_anime_list": "MY ANIME LIST",
    "dashboard.html.my_series_list": "MY SERIES LIST",
    "dashboard.html.my_movie_list": "MY MOVIE LIST",
    "dashboard.html.my_reading_list": "MY READING LIST",
    "dashboard.html.my_game_list": "MY GAME LIST",
    "dashboard.html.total_anime": "TOTAL ANIME",
    "dashboard.html.average_rating": "AVERAGE RATING",
    "dashboard.html.all_0": "ALL (0)",
    "dashboard.html.completed_0": "COMPLETED (0)",
    "dashboard.html.incomplete_0": "INCOMPLETE (0)",
    "dashboard.html.dropped_0": "DROPPED (0)",
    "dashboard.html.add_new": "ADD NEW",
    "dashboard.html.your_personal_guide": "YOUR PERSONAL GUIDE",
    "dashboard.html.tell_us_how_you_feel_and_let_your_compass_guide_you_toward_your_next_story":
      "Tell us how you feel, and let your Compass guide you toward your next story.",
    "dashboard.html.how_are_you_feeling_right_now":
      "How are you feeling right now?",
    "dashboard.html.happy": "😊 Happy",
    "dashboard.html.sad": "😢 Sad",
    "dashboard.html.anxious": "😰 Anxious",
    "dashboard.html.calm": "😌 Calm",
    "dashboard.html.tired": "😴 Tired",
    "dashboard.html.excited": "🤩 Excited",
    "dashboard.html.how_would_you_like_to_feel": "How would you like to feel?",
    "dashboard.html.joy": "✨ Joy",
    "dashboard.html.comfort": "💜 Comfort",
    "dashboard.html.peace": "🌙 Peace",
    "dashboard.html.inspiration": "🌟 Inspiration",
    "dashboard.html.excitement": "⚡ Excitement",
    "dashboard.html.energy": "🔥 Energy",
    "dashboard.html.how_much_time_do_you_have": "How much time do you have?",
    "dashboard.html.30_min": "30 min",
    "dashboard.html.1_hour": "1 hour",
    "dashboard.html.1_5_hours": "1.5 hours",
    "dashboard.html.2_hours": "2 hours",
    "dashboard.html.no_time_limit": "No time limit",
    "dashboard.html.what_would_you_like_to_watch":
      "What would you like to watch?",
    "dashboard.html.movie": "🎬 Movie",
    "dashboard.html.series": "📺 Series",
    "dashboard.html.surprise_me": "💫 Surprise me",
    "dashboard.html.save_this_compass_search": "Save this Compass search",
    "dashboard.html.save_your_selected_mood_desired_emotion_time_content_type_and_recommended_titles_to_y":
      "Save your selected mood, desired emotion, time, content type, and recommended titles to your account.",
    "dashboard.html.search": "SEARCH",
    "dashboard.html.your_compass_search_is_not_saved_unless_you_choose_to_save_it":
      "Your Compass search is not saved unless you choose to save it.",
    "dashboard.html.your_compass_request": "Your Compass request ✦",
    "dashboard.html.personalized_recommendations_will_appear_here_when_the_recommendation_engine_is_conne":
      "Personalized recommendations will appear here when the recommendation engine is connected.",
    "dashboard.html.add_photo": "ADD PHOTO",
    "dashboard.html.remove_photo": "REMOVE PHOTO",
    "dashboard.html.genres": "Genres:",
    "dashboard.html.select_genres": "Select genres...",
    "dashboard.html.loading_genres": "Loading genres...",
    "dashboard.html.total_episodes": "Total Episodes:",
    "dashboard.html.status": "Status:",
    "dashboard.html.incomplete": "INCOMPLETE",
    "dashboard.html.completed": "COMPLETED",
    "dashboard.html.dropped": "DROPPED",
    "dashboard.html.description": "Description:",
    "dashboard.html.my_review": "My Review:",
    "dashboard.html.text": "Text:",
    "dashboard.html.delete": "DELETE",
    "dashboard.html.save": "SAVE",
    "dashboard.category.anime.title": "MY ANIME LIST",
    "dashboard.category.anime.total": "TOTAL ANIME",
    "dashboard.category.anime.search": "Search anime in my list...",
    "dashboard.category.anime.length": "Total Episodes:",
    "dashboard.category.series.title": "MY SERIES LIST",
    "dashboard.category.series.total": "TOTAL SERIES",
    "dashboard.category.series.search": "Search series in my list...",
    "dashboard.category.series.length": "Total Episodes:",
    "dashboard.category.movie.title": "MY MOVIE LIST",
    "dashboard.category.movie.total": "TOTAL MOVIES",
    "dashboard.category.movie.search": "Search movies in my list...",
    "dashboard.category.movie.length": "Duration (minutes):",
    "dashboard.category.book.title": "MY READING LIST",
    "dashboard.category.book.total": "TOTAL BOOKS",
    "dashboard.category.book.search": "Search books in my list...",
    "dashboard.category.book.length": "Total Pages:",
    "dashboard.category.game.title": "MY GAME LIST",
    "dashboard.category.game.total": "TOTAL GAMES",
    "dashboard.category.game.search": "Search games in my list...",
    "dashboard.category.game.length": "Playtime (hours):",
    "dashboard.genres.select": "Select genres...",
    "dashboard.genres.legacy":
      "Saved custom genres are preserved until you change the selection.",
    "dashboard.genres.loadError": "Could not load available genres.",
    "dashboard.genres.invalidResponse": "Invalid genres response.",
    "dashboard.genres.unavailable":
      "Genre options unavailable. Try refreshing the page.",
    "dashboard.logout.error": "Could not log out.",
    "dashboard.photo.format":
      "Choose a PNG, JPG, WEBP or GIF image up to 5 MB.",
    "dashboard.photo.preview": "Could not preview the photo.",
    "dashboard.save": "SAVE",
    "dashboard.saveChanges": "SAVE CHANGES",
    "dashboard.addEntry": "Add new entry",
    "dashboard.noCover": "NO COVER",
    "dashboard.myReview": "My Review:",
    "dashboard.status.all": "ALL",
    "dashboard.status.completed": "COMPLETED",
    "dashboard.status.incomplete": "INCOMPLETE",
    "dashboard.status.dropped": "DROPPED",
    "dashboard.genres.tooLong": "Selected genres exceed 100 characters.",
    "dashboard.saving": "SAVING...",
    "dashboard.entry.saveError": "Could not save entry.",
    "dashboard.photo.uploading": "UPLOADING PHOTO...",
    "dashboard.photo.uploadError": "Could not upload photo.",
    "dashboard.photo.removing": "REMOVING PHOTO...",
    "dashboard.photo.removeError": "Could not remove photo.",
    "dashboard.entry.updated": "Entry updated successfully.",
    "dashboard.entry.saved": "Entry saved successfully.",
    "dashboard.entry.refreshFailed":
      "Entry saved, but the library could not refresh.",
    "dashboard.entry.deleteConfirm": "Delete this entry permanently?",
    "dashboard.entry.deleteError": "Could not delete entry.",
    "dashboard.entry.deleted": "Entry deleted successfully.",
    "dashboard.entry.deleteRefreshFailed":
      "Entry deleted, but the library could not refresh.",
    "dashboard.entry.loadError": "Could not load entries.",
    "dashboard.genres.count": "{count}/{max} selected · Max {limit} characters",
    "dashboard.ratingStars": "Rate {number} stars",
    "dashboard.editEntry": "Edit {title}",
    "dashboard.openEntry": "Open {title}",
    "dashboard.entry.photoFailed":
      "Entry saved, but the photo change failed: {message}",
    "compass.label.current_mood.happy": "Happy",
    "compass.label.current_mood.sad": "Sad",
    "compass.label.current_mood.anxious": "Anxious",
    "compass.label.current_mood.calm": "Calm",
    "compass.label.current_mood.tired": "Tired",
    "compass.label.current_mood.excited": "Excited",
    "compass.label.desired_emotion.joy": "Joy",
    "compass.label.desired_emotion.comfort": "Comfort",
    "compass.label.desired_emotion.calm": "Peace",
    "compass.label.desired_emotion.inspiration": "Inspiration",
    "compass.label.desired_emotion.thrill": "Excitement",
    "compass.label.desired_emotion.energy": "Energy",
    "compass.label.available_time.30": "30 minutes",
    "compass.label.available_time.60": "1 hour",
    "compass.label.available_time.90": "1.5 hours",
    "compass.label.available_time.120": "2 hours",
    "compass.label.content_type.movie": "Movie",
    "compass.label.content_type.series": "Series",
    "compass.label.content_type.either": "Movie or series",
    "compass.history.deleteConfirm":
      "Delete this saved Compass search? Its recommendations and feedback will also be deleted. This cannot be undone.",
    "compass.history.empty":
      "No saved searches yet. You can use Compass without saving anything.",
    "compass.suggest.limited":
      "The current catalog has limited emotional tags for this choice.",
    "compass.status.partialC":
      "We won't fill the remaining places with unrelated titles.",
    "compass.suggest.timeA":
      "A longer time limit may help, but additional emotional ",
    "compass.suggest.bothA":
      "You can try 'Movie or series' or a longer time limit, ",
    "compass.suggest.typeA":
      "Including both movies and series broadens the search, ",
    "compass.history.unavailableB":
      "'Save this Compass search' to continue without saving.",
    "compass.status.completeA":
      "We found 3 titles matching your selected preferences ",
    "compass.suggest.bothB":
      "but these changes may not reveal additional matches.",
    "compass.history.noMatches":
      "No matching titles were found for this saved search.",
    "compass.suggest.moreA": "More recommendations may become available after ",
    "compass.status.partialA":
      "These are the available matches for your chosen ",
    "compass.suggest.moreB": "additional emotional annotations are reviewed.",
    "compass.session.expired": "Your session has expired. Please log in again.",
    "compass.status.emptyA": "We couldn't find a title with the selected ",
    "compass.status.emptyB": "emotional tag that also meets your content ",
    "compass.history.unavailableA":
      "History saving is not enabled yet. Uncheck ",
    "compass.suggest.typeB": "but may not provide more recommendations.",
    "compass.search.waitMessage": "Your Compass is exploring the catalog...",
    "compass.status.partialB": "emotion, content type, and time limit. ",
    "compass.feedback.rateTitle": "Rate this recommendation after watching",
    "compass.feedback.note": "Optional note about this recommendation",
    "compass.feedback.fitRequired": "Choose an emotional fit score first.",
    "compass.recommendations.error": "Unable to generate recommendations.",
    "compass.history.deleteError": "Unable to delete this saved search.",
    "compass.history.loadError": "Unable to load your saved searches.",
    "compass.validation.all": "Please answer all four questions.",
    "compass.feedback.achieved": "Did you feel the desired emotion?",
    "compass.suggest.timeB": "annotations may still be needed.",
    "compass.status.completeB": "using the current catalog tags.",
    "compass.results.heading": "Your Compass Recommendations ✦",
    "compass.history.loading": "Loading your saved searches...",
    "compass.feedback.saveError": "Unable to save your feedback.",
    "compass.feedback.editTitle": "Your feedback · Edit anytime",
    "compass.feedback.saved": "Feedback saved successfully.",
    "compass.status.two": "2 recommendations found ✦",
    "compass.status.ready": "Your matches are ready ✦",
    "compass.status.one": "1 recommendation found ✦",
    "compass.history.view": "VIEW MY SAVED SEARCHES ✦",
    "compass.history.hide": "HIDE MY SAVED SEARCHES ✦",
    "compass.feedback.fit": "Emotional fit (required)",
    "compass.feedback.rating": "Title rating (optional)",
    "compass.search.waitTitle": "Finding your matches ✦",
    "compass.status.empty": "No matches just yet ✦",
    "compass.status.emptyC": "and time preferences.",
    "compass.error.title": "Something went wrong",
    "compass.feedback.comment": "Comment (optional)",
    "compass.history.delete": "DELETE THIS SEARCH",
    "compass.error.retry": "Please try again.",
    "compass.feedback.noAnswer": "Prefer not to say",
    "compass.history.dateError": "Date unavailable",
    "compass.feedback.update": "UPDATE FEEDBACK",
    "compass.validation.title": "Almost there!",
    "compass.feedback.save": "SAVE FEEDBACK",
    "compass.searching": "SEARCHING...",
    "compass.history.deleting": "DELETING...",
    "compass.feedback.selectRating": "Select 1–5",
    "compass.feedback.notRated": "Not rated",
    "compass.feedback.saving": "SAVING...",
    "compass.feedback.yes": "Yes",
    "compass.feedback.no": "No",
    "compass.durationEpisode": "{minutes} min/episode",
    "compass.durationMinutes": "{minutes} min",
    "compass.genres": "Genres: {genres}",
    "compass.score": "Prototype relevance score: {score} / 1.00",
    "compass.scoreUnavailable": "Prototype relevance score unavailable",
    "compass.researchNote":
      "These are preliminary recommendations based on technical emotional tags. Relevance scores are heuristic and have not been validated through independent user research.",
    "compass.history.score": " · score {score}",
    "compass.history.emotionalFit": " · emotional fit {fit}/5",
    "genre.Action": "Action",
    "genre.Adventure": "Adventure",
    "genre.Animation": "Animation",
    "genre.Comedy": "Comedy",
    "genre.Crime": "Crime",
    "genre.Documentary": "Documentary",
    "genre.Drama": "Drama",
    "genre.Family": "Family",
    "genre.Fantasy": "Fantasy",
    "genre.History": "History",
    "genre.Horror": "Horror",
    "genre.Music": "Music",
    "genre.Mystery": "Mystery",
    "genre.Romance": "Romance",
    "genre.Science Fiction": "Science Fiction",
    "genre.Sci-Fi & Fantasy": "Sci-Fi & Fantasy",
    "genre.Thriller": "Thriller",
    "genre.TV Movie": "TV Movie",
    "genre.War": "War",
    "genre.Western": "Western",
    "genre.Action & Adventure": "Action & Adventure",
    "genre.Kids": "Kids",
    "genre.News": "News",
    "genre.Reality": "Reality",
    "genre.Soap": "Soap",
    "genre.Talk": "Talk",
    "genre.War & Politics": "War & Politics",
  });

  Object.assign(translations.uk, {
    "compass.label.available_time.180plus": "Без обмежень",
  });
  Object.assign(translations.en, {
    "compass.label.available_time.180plus": "No time limit",
  });

  // Onboarding and recommendation reasons
  Object.assign(translations.uk, {
    "onboarding.pageTitle": "Відкрий свої вподобання | MyList Compass",
    "onboarding.back": "← До My List",
    "onboarding.profileSetup": "НАЛАШТУВАННЯ ПРОФІЛЮ",
    "onboarding.eyebrow": "ТВІЙ ОСОБИСТИЙ COMPASS",
    "onboarding.headline": "Відкриймо твої вподобання.",
    "onboarding.description":
      "Розкажи, що тобі подобається, і Compass підбере історії саме для тебе.",
    "onboarding.preview":
      "Попередній перегляд. Твої вподобання ще не збережено.",
    "onboarding.step1": "Крок 1 із 2",
    "onboarding.step2": "Крок 2 із 2",
    "onboarding.genresTitle": "Які жанри тобі подобаються?",
    "onboarding.genresHelp": "Вибери від 3 до 5 улюблених жанрів.",
    "onboarding.loading": "Завантаження жанрів...",
    "onboarding.counterInitial": "Вибрано 0 із 5",
    "onboarding.counter": "Вибрано {count} із {max}",
    "onboarding.continue": "ПРОДОВЖИТИ →",
    "onboarding.contentTitle": "Що ти полюбляєш дивитися?",
    "onboarding.contentHelp": "Вибери улюблений формат контенту.",
    "onboarding.movies": "Фільми",
    "onboarding.series": "Серіали",
    "onboarding.both": "Обидва",
    "onboarding.movieHelp": "Історії на один вечір",
    "onboarding.seriesHelp": "Історії з продовженням",
    "onboarding.bothHelp": "Мені подобаються всі формати",
    "onboarding.backButton": "← НАЗАД",
    "onboarding.seeProfile": "ПЕРЕГЛЯНУТИ ПРОФІЛЬ →",
    "onboarding.profileTitle": "Твій профіль Compass",
    "onboarding.profileHelp":
      "Ці вподобання допоможуть Compass персоналізувати твої перші рекомендації.",
    "onboarding.favoriteGenres": "Твої улюблені жанри",
    "onboarding.preferredContent": "Твій улюблений формат",
    "onboarding.resultNotice":
      "Це попередній перегляд профілю. Дані ще не збережені.",
    "onboarding.edit": "← ЗМІНИТИ ВИБІР",
    "onboarding.footer": "MYLIST COMPASS ✦ ЗНАЙДИ СВІЙ НАПРЯМОК",
    "onboarding.contentLabel.movie": "🎬 Фільми",
    "onboarding.contentLabel.series": "📺 Серіали",
    "onboarding.contentLabel.either": "✨ Фільми та серіали",
    "onboarding.saveWarning":
      "Твої вподобання буде збережено лише після натискання «ЗБЕРЕГТИ ПРОФІЛЬ». Ти зможеш змінити їх пізніше.",
    "onboarding.saveButton": "ЗБЕРЕГТИ ПРОФІЛЬ →",
    "onboarding.loginRequired": "Увійди в My List, щоб продовжити.",
    "onboarding.loadFailed": "Не вдалося завантажити налаштування профілю.",
    "onboarding.invalidResponse": "Некоректна відповідь сервера.",
    "onboarding.loadedPreferences":
      "Доступно жанрів: {count}. Збережені вподобання завантажено.",
    "onboarding.availableGenres": "Доступно жанрів: {count}.",
    "onboarding.unsavedNotice":
      "Твій вибір ще не збережено. Натисни «ЗБЕРЕГТИ ПРОФІЛЬ», щоб оновити вподобання.",
    "onboarding.selectContent": "Вибери формат контенту.",
    "onboarding.selectGenres": "Вибери від 3 до 5 жанрів.",
    "onboarding.savingButton": "ЗБЕРЕЖЕННЯ...",
    "onboarding.savingNotice": "Зберігаємо твої вподобання в MyList Compass...",
    "onboarding.expired": "Сеанс завершився. Увійди ще раз.",
    "onboarding.saveFailed": "Не вдалося зберегти твої вподобання.",
    "onboarding.unexpectedResponse": "Неочікувана відповідь сервера.",
    "onboarding.savedButton": "ЗБЕРЕЖЕНО ✓",
    "onboarding.savedNotice":
      "Профіль Compass успішно збережено! Твої улюблені жанри та формат контенту тепер збережені в PostgreSQL.",
    "onboarding.retry": "СПРОБУВАТИ ЗНОВУ →",
    "onboarding.unconfirmed": "Збереження змін не підтверджено. {error}",
    "compass.reason.Matches your desired emotion": "Відповідає бажаній емоції",
    "compass.reason.Considers your current mood":
      "Враховує твій поточний настрій",
    "compass.reason.Matches your favorite genres":
      "Збігається з улюбленими жанрами",
    "compass.reason.Related to your favorite genres":
      "Споріднений з улюбленими жанрами",
    "compass.reason.Adjusted using your past emotional-fit feedback":
      "Скориговано з урахуванням попередніх емоційних відгуків",
  });
  Object.assign(translations.en, {
    "onboarding.pageTitle": "Discover Your Taste | MyList Compass",
    "onboarding.back": "← Back to My List",
    "onboarding.profileSetup": "PROFILE SETUP",
    "onboarding.eyebrow": "YOUR PERSONAL COMPASS",
    "onboarding.headline": "Let's discover your taste.",
    "onboarding.description":
      "Tell us what you love, and let Compass find stories that feel right for you.",
    "onboarding.preview":
      "Preview mode. Your preferences have not been saved yet.",
    "onboarding.step1": "Step 1 of 2",
    "onboarding.step2": "Step 2 of 2",
    "onboarding.genresTitle": "What genres do you love?",
    "onboarding.genresHelp": "Choose 3 to 5 genres that you enjoy the most.",
    "onboarding.loading": "Loading genres...",
    "onboarding.counterInitial": "0 of 5 selected",
    "onboarding.counter": "{count} of {max} selected",
    "onboarding.continue": "CONTINUE →",
    "onboarding.contentTitle": "What do you prefer watching?",
    "onboarding.contentHelp": "Choose your favorite type of content.",
    "onboarding.movies": "Movies",
    "onboarding.series": "Series",
    "onboarding.both": "Both",
    "onboarding.movieHelp": "Stories in one sitting",
    "onboarding.seriesHelp": "Stories that unfold",
    "onboarding.bothHelp": "I love all kinds of stories",
    "onboarding.backButton": "← BACK",
    "onboarding.seeProfile": "SEE MY PROFILE →",
    "onboarding.profileTitle": "Your Compass Profile",
    "onboarding.profileHelp":
      "These preferences will help Compass personalize your first recommendations.",
    "onboarding.favoriteGenres": "Your favorite genres",
    "onboarding.preferredContent": "Your preferred content",
    "onboarding.resultNotice":
      "This is a preview of your initial profile. Nothing has been saved yet.",
    "onboarding.edit": "← EDIT MY CHOICES",
    "onboarding.footer": "MYLIST COMPASS ✦ FIND YOUR DIRECTION",
    "onboarding.contentLabel.movie": "🎬 Movies",
    "onboarding.contentLabel.series": "📺 Series",
    "onboarding.contentLabel.either": "✨ Movies & Series",
    "onboarding.saveWarning":
      "Your preferences will be saved only when you click SAVE MY PROFILE. You can update them later.",
    "onboarding.saveButton": "SAVE MY PROFILE →",
    "onboarding.loginRequired": "Please log in to My List to continue.",
    "onboarding.loadFailed": "Unable to load your onboarding options.",
    "onboarding.invalidResponse": "Invalid server response.",
    "onboarding.loadedPreferences":
      "{count} genres available. Your saved preferences have been loaded.",
    "onboarding.availableGenres": "{count} genres available.",
    "onboarding.unsavedNotice":
      "Your current choices have not been saved yet. Click SAVE MY PROFILE to update your preferences.",
    "onboarding.selectContent": "Please select a content type.",
    "onboarding.selectGenres": "Please select 3 to 5 genres.",
    "onboarding.savingButton": "SAVING...",
    "onboarding.savingNotice": "Saving your preferences to MyList Compass...",
    "onboarding.expired": "Your session has expired. Please log in again.",
    "onboarding.saveFailed": "Unable to save your preferences.",
    "onboarding.unexpectedResponse": "Unexpected response from the server.",
    "onboarding.savedButton": "SAVED ✓",
    "onboarding.savedNotice":
      "Your Compass profile has been saved successfully! Your favorite genres and content preferences are now stored in PostgreSQL.",
    "onboarding.retry": "TRY AGAIN →",
    "onboarding.unconfirmed":
      "Your changes were not confirmed as saved. {error}",
    "compass.reason.Matches your desired emotion":
      "Matches your desired emotion",
    "compass.reason.Considers your current mood": "Considers your current mood",
    "compass.reason.Matches your favorite genres":
      "Matches your favorite genres",
    "compass.reason.Related to your favorite genres":
      "Related to your favorite genres",
    "compass.reason.Adjusted using your past emotional-fit feedback":
      "Adjusted using your past emotional-fit feedback",
  });

  function readLanguage() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return translations[value] ? value : DEFAULT_LANGUAGE;
    } catch {
      return DEFAULT_LANGUAGE;
    }
  }

  let currentLanguage = readLanguage();

  function t(key, parameters = {}) {
    const template =
      translations[currentLanguage][key] ??
      translations[DEFAULT_LANGUAGE][key] ??
      key;
    return template.replace(/\{(\w+)\}/g, (_, name) =>
      String(parameters[name] ?? ""),
    );
  }

  function applyTranslations(root = document) {
    const attrs = {
      "data-i18n": "textContent",
      "data-i18n-placeholder": "placeholder",
      "data-i18n-aria-label": "aria-label",
      "data-i18n-title": "title",
    };

    Object.entries(attrs).forEach(([attr, property]) => {
      root.querySelectorAll(`[${attr}]`).forEach((element) => {
        const translation = t(element.getAttribute(attr));
        if (property === "aria-label") {
          element.setAttribute("aria-label", translation);
        } else {
          element[property] = translation;
        }
      });
    });

    document.documentElement.lang = currentLanguage;

    document
      .querySelectorAll(".language-button[data-lang]")
      .forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.lang === currentLanguage),
        );
      });
  }

  function setLanguage(nextLanguage) {
    if (!translations[nextLanguage]) return;
    currentLanguage = nextLanguage;
    try {
      localStorage.setItem(STORAGE_KEY, nextLanguage);
    } catch {
      // Local storage can be unavailable in privacy-restricted browsing.
    }
    applyTranslations();
    document.dispatchEvent(
      new CustomEvent("mylist:languagechange", {
        detail: { language: currentLanguage },
      }),
    );
  }

  function translateServerError(message, fallbackKey) {
    const value = String(message ?? "").trim();
    if (
      /invalid credentials|incorrect (email|password)|invalid email or password|wrong password/i.test(
        value,
      )
    ) {
      return t("auth.invalidCredentials");
    }
    if (
      /email already (exists|registered|in use)|email is already/i.test(value)
    ) {
      return t("auth.emailExists");
    }
    // Preserve unknown server validation messages rather than hiding useful details.
    return value || t(fallbackKey);
  }

  window.MyListI18n = {
    t,
    setLanguage,
    getLanguage: () => currentLanguage,
    applyTranslations,
    translateServerError,
  };

  document.addEventListener("DOMContentLoaded", () => {
    applyTranslations();
    document
      .querySelectorAll(".language-button[data-lang]")
      .forEach((button) => {
        button.addEventListener("click", () =>
          setLanguage(button.dataset.lang),
        );
      });
  });
})();
