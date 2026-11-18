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
    "dashboard.delete.title": "Видалити «{title}»?",
    "dashboard.delete.description":
      "Обери, що робити з даними рекомендацій Compass.",
    "dashboard.delete.reset": "Видалити та скасувати оцінку Compass",
    "dashboard.delete.resetHint":
      "Якщо твір було позначено переглянутим помилково.",
    "dashboard.delete.keep": "Видалити лише з бібліотеки",
    "dashboard.delete.keepHint":
      "Якщо твір справді переглянуто, але ти хочеш прибрати його з бібліотеки.",
    "dashboard.delete.cancel": "Скасувати",
    "dashboard.delete.confirm": "Видалити",
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
    "dashboard.delete.title": "Delete “{title}”?",
    "dashboard.delete.description":
      "Choose what to do with your Compass recommendation data.",
    "dashboard.delete.reset": "Delete and cancel Compass feedback",
    "dashboard.delete.resetHint":
      "If you marked this work as watched by mistake.",
    "dashboard.delete.keep": "Delete from library only",
    "dashboard.delete.keepHint":
      "If you really watched this work but want to remove it from your library.",
    "dashboard.delete.cancel": "Cancel",
    "dashboard.delete.confirm": "Delete",
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

  // Research and catalog administration
  Object.assign(translations.uk, {
    "final.text.0": "Адміністрування каталогу | MyList Compass",
    "final.text.1": "Адміністрування каталогу",
    "final.text.2":
      "Шукай у TMDB та керуй дослідницьким каталогом медіатворів.",
    "final.text.3": "← Повернутися до MyList",
    "final.text.4": "Перевірка прав адміністратора...",
    "final.text.5": "Пошук у TMDB",
    "final.text.6": "Знайди фільми або серіали в TMDB.",
    "final.text.7": "Тип медіатвору",
    "final.text.8": "Фільм",
    "final.text.9": "Серіал",
    "final.text.10": "Назва",
    "final.text.11": "Шукати",
    "final.text.12": "Результати пошуку",
    "final.text.13": "Попередній перегляд медіатвору",
    "final.text.14": "Порівняння з каталогом",
    "final.text.15":
      "Лише попередній перегляд. Зміни до PostgreSQL не вноситимуться.",
    "final.text.16": "Введи назву фільму або серіалу",
    "final.text.17": "Дослідження емоцій | MyList Compass",
    "final.text.18": "← Повернутися до My List",
    "final.text.19": "ПОПЕРЕДНІЙ ПЕРЕГЛЯД ДОСЛІДЖЕННЯ",
    "final.text.20": "ДОСЛІДЖЕННЯ ЕМОЦІЙНИХ ПОЗНАЧОК",
    "final.text.21": "Кожна історія змушує нас",
    "final.text.22": "щось відчувати.",
    "final.text.23":
      "Допоможи краще зрозуміти емоційні враження від фільмів і серіалів.",
    "final.text.24": "Демонстраційний режим.",
    "final.text.25":
      "Твої відповіді надсилаються на сервер лише для перевірки та не зберігаються як дослідницькі позначки. Участь у дослідженні й оформлення згоди наразі недоступні.",
    "final.text.26": "Перед початком",
    "final.text.27": "Ознайомся з інформацією про заплановане дослідження.",
    "final.text.28": "Про це дослідження",
    "final.text.29":
      "MyList Compass — дослідницький проєкт, присвячений використанню емоційних характеристик фільмів і серіалів для персоналізованих рекомендацій.",
    "final.text.30": "Що потрібно буде робити?",
    "final.text.31":
      "Учасники обиратимуть знайомий фільм або серіал та оцінюватимуть шість емоційних характеристик: радість, затишок, спокій, натхнення, хвилювання й енергію.",
    "final.text.32":
      "Кожну характеристику оцінюють за шкалою інтенсивності від 0 до 3 та впевненості від 1 до 3.",
    "final.text.33": "Чи потрібно дивитися всі фільми?",
    "final.text.34":
      "Ні. Учасники оцінюватимуть лише знайомі твори. Дивитися незнайомі фільми чи серіали не потрібно.",
    "final.text.35":
      "Оцінювання після перегляду твору й очікування на основі трейлера або опису — різні джерела інформації. У дослідницькому аналізі їх розрізнятимуть.",
    "final.text.36": "Які дані планується збирати?",
    "final.text.37":
      "Планується збирати назву вибраного твору, оцінки емоцій, рівень упевненості, джерело враження та необов’язкові коментарі.",
    "final.text.38":
      "Дослідницькі записи будуть пов’язані з псевдонімним кодом учасника, який прив’язаний до авторизованого облікового запису My List.",
    "final.text.39": "Як використовуватимуться дані?",
    "final.text.40":
      "Дані допоможуть створювати емоційний набір даних медіатворів, порівнювати оцінки учасників і досліджувати алгоритми рекомендацій.",
    "final.text.41":
      "Оцінки після повного перегляду відокремлюватимуть від прогнозів за трейлерами чи описами.",
    "final.text.42": "Чи добровільна участь?",
    "final.text.43":
      "Так. Участь у запланованому дослідженні буде добровільною й не залежатиме від звичайного користування My List.",
    "final.text.44":
      "Учасники зможуть припинити участь за процедурою, яку буде описано в остаточних документах дослідження.",
    "final.text.45": "Важливо:",
    "final.text.46":
      "Це проєкт інформаційного документа. До запрошення реальних учасників потрібно остаточно визначити контакти дослідників, строки зберігання даних, процедуру виходу та умови участі. Формальна згода тут не збирається.",
    "final.text.47":
      "Я ознайомився(-лася) з проєктом інформації та хочу продовжити тестування форми оцінювання.",
    "final.text.48": "ПРОДОВЖИТИ ДО ФОРМИ →",
    "final.text.49": "Обери історію",
    "final.text.50": "Обери твір і вкажи, на чому ґрунтується твоє враження.",
    "final.text.51": "Фільм або серіал",
    "final.text.52": "Обери назву",
    "final.text.53":
      "Обери знайомий твір. Якщо жоден із доступних творів тобі не знайомий, заповнювати форму не потрібно.",
    "final.text.54": "На чому ґрунтується твоя оцінка?",
    "final.text.55": "Обери джерело",
    "final.text.56": "Я дивився(-лася) цей твір",
    "final.text.57": "Я дивився(-лася) трейлер",
    "final.text.58": "Я читав(-ла) опис",
    "final.text.59":
      "Якщо ти дивився(-лася) твір, оціни його емоційні характеристики за власними враженнями. Якщо бачив(-ла) лише трейлер або читав(-ла) опис, оціни свої очікування. Не видавай очікування за досвід повного перегляду.",
    "final.text.60": "Як оцінювати емоції",
    "final.text.61": "Прочитай інструкцію перед відповідями.",
    "final.text.62": "Що саме оцінюється?",
    "final.text.63":
      "Подумай про загальне емоційне враження від вибраного фільму або серіалу.",
    "final.text.64":
      "Оціни, наскільки сильно ти пов’язуєш цю історію з кожною емоцією. Орієнтуйся на власне враження або очікування, а не тільки на емоції персонажів.",
    "final.text.65":
      "Тебе не просять вимірювати фактичну зміну настрою до та після перегляду.",
    "final.text.66": "Важливі правила",
    "final.text.67": "Оцінюй незалежно.",
    "final.text.68":
      "Кожну емоцію оцінюй окремо. Фільм може отримати високі оцінки в декількох категоріях.",
    "final.text.69": "Правильних відповідей немає.",
    "final.text.70": "Емоційні враження різних людей можуть відрізнятися.",
    "final.text.71": "Реалістично оцінюй упевненість.",
    "final.text.72":
      "Якщо погано пам’ятаєш історію або маєш мало інформації, обери нижчий рівень упевненості.",
    "final.text.73": "Нуль — припустима оцінка.",
    "final.text.74":
      "Обирай інтенсивність 0, якщо не пов’язуєш твір із певною емоцією.",
    "final.text.75": "Емоційні характеристики",
    "final.text.76": "Оцінюй кожну емоційну категорію окремо.",
    "final.text.77": "Шкала інтенсивності",
    "final.text.78": "0 — Немає:",
    "final.text.79": "Емоція відсутня або майже непомітна.",
    "final.text.80": "1 — Слабка:",
    "final.text.81": "Емоція трохи відчутна.",
    "final.text.82": "2 — Помірна:",
    "final.text.83": "Емоція чітко відчутна.",
    "final.text.84": "Емоція чітко відчутна.",
    "final.text.85": "3 — Сильна:",
    "final.text.86": "Емоція виражена сильно.",
    "final.text.87": "Шкала впевненості",
    "final.text.88": "1 — Низька:",
    "final.text.89": "Ти не впевнений(-а) у своїй оцінці.",
    "final.text.90": "2 — Середня:",
    "final.text.91": "Ти достатньо впевнений(-а) у своїй оцінці.",
    "final.text.92": "3 — Висока:",
    "final.text.93": "Ти дуже впевнений(-а) у своїй оцінці.",
    "final.text.94": "Пояснення емоцій",
    "final.text.95": "😊 Радість",
    "final.text.96": "Щастя, веселощі, захоплення або радісне враження.",
    "final.text.97": "💜 Затишок",
    "final.text.98":
      "Душевне тепло, підтримка, заспокоєння або відчуття безпеки.",
    "final.text.99": "🌙 Спокій",
    "final.text.100":
      "Розслаблення, умиротворення або зменшення емоційної напруги.",
    "final.text.101": "✨ Натхнення",
    "final.text.102":
      "Надія, мотивація, заохочення або прагнення позитивних змін.",
    "final.text.103": "⚡ Хвилювання",
    "final.text.104": "Напруга, очікування, інтрига або захопливі відчуття.",
    "final.text.105": "🔥 Енергія",
    "final.text.106": "Ентузіазм, бадьорість або відчуття припливу сил.",
    "final.text.107": "Додаткові примітки",
    "final.text.108": "Цей розділ необов’язковий.",
    "final.text.109": "Хочеш пояснити свою оцінку?",
    "final.text.110": "Поділися думками про емоційні враження...",
    "final.text.111":
      "Не вказуй у примітках імена, контакти або іншу особисту інформацію.",
    "final.text.112": "ОЧИСТИТИ ВІДПОВІДІ",
    "final.text.113": "ПЕРЕВІРИТИ ВІДПОВІДІ →",
    "final.text.114": "MYLIST COMPASS ✦ ДОСЛІДНИЦЬКИЙ ПРОЄКТ",
    "final.text.115": "Невідомо",
    "final.text.116": "Рік невідомий",
    "final.text.117": "Невідомий медіатвір",
    "final.text.118": "Імпортувати до каталогу",
    "final.text.119":
      "Ця дія створить новий медіазапис у PostgreSQL. Жанри буде прив’язано, але емоційні оцінки не створюватимуться.",
    "final.text.120": "Для підтвердження введи IMPORT:",
    "final.text.121":
      "Перегляд не змінює PostgreSQL. Підтверджений імпорт створює новий запис у каталозі.",
    "final.text.122": "Потрібні права адміністратора.",
    "final.text.123":
      "Доступ адміністратора надано. Інструменти каталогу доступні.",
    "final.text.124": "Нічого не знайдено.",
    "final.text.125": "Переглянути",
    "final.text.126": "Введи назву від 2 до 100 символів.",
    "final.text.127": "Пошук у TMDB...",
    "final.text.128": "Неочікувана відповідь пошуку.",
    "final.text.129":
      "Знайдено результатів: {total}. На першій сторінці показано: {count}.",
    "final.text.130": "Завантаження відомостей про медіатвір...",
    "final.text.131": "Неочікувана відповідь попереднього перегляду.",
    "final.text.132": "Категорія",
    "final.text.133": "Рік",
    "final.text.134": "Тривалість",
    "final.text.135": "хв",
    "final.text.136": "Жанри",
    "final.text.137": "Опис",
    "final.text.138": "Опис відсутній",
    "final.text.139": "Статус збігу",
    "final.text.140": "Перевірено варіантів назви",
    "final.text.141": "У локальному каталозі збігів не знайдено.",
    "final.text.142": "Локальний ID",
    "final.text.143": "Причина",
    "final.text.144":
      "Кандидат на імпорт. Остаточна перевірка відбудеться на сервері.",
    "final.text.145": "Імпорт медіатвору до PostgreSQL...",
    "final.text.146": "Завантаження назв...",
    "final.text.147": "Увійди в My List, щоб завантажити каталог.",
    "final.text.148": "Не вдалося завантажити медіакаталог.",
    "final.text.149": "Некоректна відповідь каталогу.",
    "final.text.150": "Доступних творів немає",
    "final.text.151": "Обери значення",
    "final.text.152": "Радість",
    "final.text.153": "Затишок",
    "final.text.154": "Спокій",
    "final.text.155": "Натхнення",
    "final.text.156": "Хвилювання",
    "final.text.157": "Енергія",
    "final.text.158": "Щастя, веселощі, радість",
    "final.text.159": "Душевне тепло, заспокоєння, безпека",
    "final.text.160": "Розслаблення, спокій, зменшення напруги",
    "final.text.161": "Мотивація, надія, заохочення",
    "final.text.162": "Напруга, передчуття, захоплення",
    "final.text.163": "Бадьорість, ентузіазм, активність",
    "final.text.164": "Інтенсивність",
    "final.text.165": "Упевненість",
    "final.text.166": "0 — Немає",
    "final.text.167": "1 — Слабка",
    "final.text.168": "2 — Помірна",
    "final.text.169": "3 — Сильна",
    "final.text.170": "1 — Низька",
    "final.text.171": "2 — Середня",
    "final.text.172": "3 — Висока",
    "final.text.173": "Попередній перегляд оцінювання ✦",
    "final.text.174": "Медіатвір:",
    "final.text.175": "ID у каталозі:",
    "final.text.176": "Джерело оцінки:",
    "final.text.177": "Перевірку на сервері пройдено ✓",
    "final.text.178": "Емоція",
    "final.text.179":
      "Лише попередній перегляд. Відповіді пройшли перевірку на сервері, але не були збережені.",
    "final.text.180": "Некоректний вибір",
    "final.text.181": "Обери медіатвір із каталогу.",
    "final.text.182": "ПЕРЕВІРКА...",
    "final.text.183": "Перевір свої відповіді",
    "final.text.184": "Некоректні дані оцінювання.",
    "final.text.185": "Термін дії сеансу минув. Увійди знову.",
    "final.text.186": "Не вдалося перевірити твою оцінку.",
    "final.text.187": "Неочікувана відповідь перевірки.",
    "final.text.188": "Перевірка недоступна",
    "final.text.189": "Спробуй ще раз.",
    "final.text.190": "Демонстраційний документ дослідження",
    "final.text.191":
      "Цей документ наведено лише для демонстрації. Ознайомлення з ним не означає формальної згоди на участь у дослідженні.",
    "final.text.192": "У тебе немає доступу до цього дослідницького документа.",
    "final.text.193": "Не вдалося завантажити демонстраційний документ.",
    "final.text.194": "Неочікувана відповідь сервера щодо документа.",
    "final.text.195": "Перевірка статусу участі в дослідженні...",
    "final.text.196": "Увійди в My List для доступу до демонстраційної форми.",
    "final.text.197": "Не вдалося перевірити статус участі.",
    "final.text.198": "Тебе ще не запросили до участі в дослідженні.",
    "final.text.199":
      "Твою участь у дослідженні припинено. Форма оцінювання більше недоступна.",
    "final.text.200": "Форма недоступна за поточного статусу участі.",
    "final.text.201": "Завантаження демонстраційного документа...",
    "final.text.202":
      "Тебе запрошено до дослідження. Перш ніж продовжити, прочитай демонстраційний документ. Це не формальна згода на участь.",
    "final.text.203":
      "Тестову участь підтверджено. Перш ніж продовжити, прочитай демонстраційний документ. Це не формальна згода на участь.",
    "final.text.204": "Не вдалося підготувати попередній перегляд дослідження.",
    "final.text.205": "Демонстраційний документ ще не завантажено.",
    "final.text.206": "Не вдалося зберегти підтвердження ознайомлення.",
    "final.text.207": "Неочікувана відповідь щодо підтвердження ознайомлення.",
    "final.text.208": "ЗБЕРЕЖЕННЯ ПІДТВЕРДЖЕННЯ...",
    "final.text.209": "Збереження тестового підтвердження...",
    "final.text.210":
      "Твоє тестове підтвердження збережено. Це не формальна згода на участь у дослідженні. Відповіді оцінювання не зберігатимуться.",
    "final.text.211":
      "Твоє тестове підтвердження вже було збережено. Дублікат не створено. Відповіді оцінювання не зберігатимуться.",
    "final.text.212": "Онови сторінку.",
    "final.text.213": "Не вдалося зберегти підтвердження. Спробуй ще раз.",
  });
  Object.assign(translations.en, {
    "final.text.0": "Catalog Administration | MyList Compass",
    "final.text.1": "Catalog Administration",
    "final.text.2": "Search TMDB and manage the research media catalog.",
    "final.text.3": "← Back to MyList",
    "final.text.4": "Checking administrator permissions...",
    "final.text.5": "Search TMDB",
    "final.text.6": "Find movies or television series in TMDB.",
    "final.text.7": "Media type",
    "final.text.8": "Movie",
    "final.text.9": "Series",
    "final.text.10": "Title",
    "final.text.11": "Search",
    "final.text.12": "Search Results",
    "final.text.13": "Media Preview",
    "final.text.14": "Catalog Matching",
    "final.text.15": "Preview only. No changes will be made to PostgreSQL.",
    "final.text.16": "Enter a movie or series title",
    "final.text.17": "Emotional Research | MyList Compass",
    "final.text.18": "← Back to My List",
    "final.text.19": "RESEARCH PREVIEW",
    "final.text.20": "EMOTIONAL ANNOTATION STUDY",
    "final.text.21": "Every story makes us",
    "final.text.22": "feel something.",
    "final.text.23":
      "Help us understand the emotional experiences associated with movies and television series.",
    "final.text.24": "Preview mode.",
    "final.text.25":
      "Your answers are sent to the server for validation but are not saved as research annotations. Research participation and formal consent are not yet enabled.",
    "final.text.26": "Before we begin",
    "final.text.27": "Please read the information about the proposed research.",
    "final.text.28": "About this research",
    "final.text.29":
      "MyList Compass is a research project exploring how emotional characteristics of movies and television series can support personalized recommendations.",
    "final.text.30": "What would you do?",
    "final.text.31":
      "Participants would select a movie or series they are familiar with and evaluate six emotional characteristics: Joy, Comfort, Peace, Inspiration, Excitement, and Energy.",
    "final.text.32":
      "Each characteristic is evaluated using an intensity scale from 0 to 3 and a confidence scale from 1 to 3.",
    "final.text.33": "Do you need to watch every movie?",
    "final.text.34":
      "No. Participants would only evaluate titles they are familiar with. There is no requirement to watch unfamiliar movies or television series.",
    "final.text.35":
      "Assessments based on watching a title and expectations based on a trailer or synopsis represent different kinds of evidence. These sources would be distinguished during research analysis.",
    "final.text.36": "What information would be collected?",
    "final.text.37":
      "The proposed study would collect the selected media item, emotional ratings, confidence levels, evidence source, and optional comments.",
    "final.text.38":
      "Research records would be associated with a pseudonymous participant code linked to an authorized My List account.",
    "final.text.39": "How would the information be used?",
    "final.text.40":
      "Research data would support the development of an emotional media dataset, comparison of annotator assessments, and evaluation of recommendation algorithms.",
    "final.text.41":
      "Evaluations based on full viewing would be distinguished from predictions based on trailers or descriptions.",
    "final.text.42": "Is participation voluntary?",
    "final.text.43":
      "Yes. Participation in the planned study would be voluntary and separate from normal use of My List.",
    "final.text.44":
      "Participants would be able to withdraw according to the procedure described in the finalized research information.",
    "final.text.45": "Important:",
    "final.text.46":
      "This is draft research information. Research contacts, data retention, withdrawal procedures, and final participation terms must be confirmed before inviting real participants. No formal research consent is collected here.",
    "final.text.47":
      "I have read this draft information and want to continue testing the annotation form.",
    "final.text.48": "CONTINUE TO FORM PREVIEW →",
    "final.text.49": "Choose your story",
    "final.text.50":
      "Select a title and tell us what your assessment is based on.",
    "final.text.51": "Movie or series",
    "final.text.52": "Select a title",
    "final.text.53":
      "Choose a title you know. If none of the available titles are familiar, you do not need to complete this form.",
    "final.text.54": "What is your assessment based on?",
    "final.text.55": "Select a source",
    "final.text.56": "I watched it",
    "final.text.57": "I watched the trailer",
    "final.text.58": "I read the synopsis",
    "final.text.59":
      "If you watched the title, rate your assessment of its emotional characteristics. If you only saw a trailer or read a synopsis, rate what you expect from that information. Do not present an expectation as a personal viewing experience.",
    "final.text.60": "How to evaluate emotions",
    "final.text.61": "Please read these instructions before answering.",
    "final.text.62": "What are you evaluating?",
    "final.text.63":
      "Think about the overall emotional impression associated with the selected movie or series.",
    "final.text.64":
      "Evaluate how strongly you associate the story with each emotion. Focus on your own impression or expectation, rather than simply identifying which emotions the characters express.",
    "final.text.65":
      "You are not being asked to measure a change in your actual mood before and after watching.",
    "final.text.66": "Important rules",
    "final.text.67": "Evaluate independently.",
    "final.text.68":
      "Each emotional category should be assessed separately. A movie can score highly in several categories.",
    "final.text.69": "There are no correct answers.",
    "final.text.70": "Emotional impressions can differ between people.",
    "final.text.71": "Do not guess your confidence.",
    "final.text.72":
      "If you remember the story poorly or have limited information, select a lower confidence level.",
    "final.text.73": "Zero is a valid answer.",
    "final.text.74":
      "Choose intensity 0 when you do not associate the title with a particular emotional characteristic.",
    "final.text.75": "Emotional characteristics",
    "final.text.76": "Evaluate each emotional category independently.",
    "final.text.77": "Intensity scale",
    "final.text.78": "0 — None:",
    "final.text.79": "The emotion is absent or not noticeable.",
    "final.text.80": "1 — Weak:",
    "final.text.81": "The emotion is slightly noticeable.",
    "final.text.82": "2 — Moderate:",
    "final.text.83": "The emotion is чітко noticeable.",
    "final.text.84": "The emotion is clearly noticeable.",
    "final.text.85": "3 — Strong:",
    "final.text.86": "The emotion is strongly expressed.",
    "final.text.87": "Confidence scale",
    "final.text.88": "1 — Low:",
    "final.text.89": "You are uncertain about your assessment.",
    "final.text.90": "2 — Medium:",
    "final.text.91": "You are reasonably confident.",
    "final.text.92": "3 — High:",
    "final.text.93": "You are very confident in your assessment.",
    "final.text.94": "Emotion definitions",
    "final.text.95": "😊 Joy",
    "final.text.96":
      "Happiness, amusement, delight, or a cheerful emotional impression.",
    "final.text.97": "💜 Comfort",
    "final.text.98":
      "Emotional warmth, reassurance, support, or a feeling of emotional safety.",
    "final.text.99": "🌙 Peace",
    "final.text.100":
      "Calmness, relaxation, tranquility, or reduced emotional tension.",
    "final.text.101": "✨ Inspiration",
    "final.text.102":
      "Hope, motivation, encouragement, or a desire for positive change.",
    "final.text.103": "⚡ Excitement",
    "final.text.104":
      "Suspense, anticipation, tension, or an exciting emotional experience.",
    "final.text.105": "🔥 Energy",
    "final.text.106":
      "Enthusiasm, stimulation, alertness, or a feeling of increased activity.",
    "final.text.107": "Additional notes",
    "final.text.108": "This section is optional.",
    "final.text.109": "Would you like to explain your assessment?",
    "final.text.110": "Share your thoughts about the emotional experience...",
    "final.text.111":
      "Please do not include names, contact details, or other personal information in your notes.",
    "final.text.112": "CLEAR ANSWERS",
    "final.text.113": "CHECK ANSWERS →",
    "final.text.114": "MYLIST COMPASS ✦ RESEARCH PROJECT",
    "final.text.115": "Unknown",
    "final.text.116": "Unknown year",
    "final.text.117": "Unknown media",
    "final.text.118": "Import to Catalog",
    "final.text.119":
      "This action creates a new media record in PostgreSQL. Genres will be linked, but emotional assessments will not be created.",
    "final.text.120": "Type IMPORT to confirm:",
    "final.text.121":
      "Reviewing media does not change PostgreSQL. A confirmed import creates a new catalog record.",
    "final.text.122": "Administrator access required.",
    "final.text.123":
      "Administrator access granted. Catalog tools are available.",
    "final.text.124": "No results found.",
    "final.text.125": "Review",
    "final.text.126": "Enter a title containing 2–100 characters.",
    "final.text.127": "Searching TMDB...",
    "final.text.128": "Unexpected search response.",
    "final.text.129":
      "Found {total} results. Showing {count} on the first page.",
    "final.text.130": "Loading media details...",
    "final.text.131": "Unexpected media review response.",
    "final.text.132": "Category",
    "final.text.133": "Year",
    "final.text.134": "Duration",
    "final.text.135": "minutes",
    "final.text.136": "Genres",
    "final.text.137": "Description",
    "final.text.138": "No description",
    "final.text.139": "Match status",
    "final.text.140": "Title variants checked",
    "final.text.141": "No matching entries found in the local catalog.",
    "final.text.142": "Local ID",
    "final.text.143": "Reason",
    "final.text.144":
      "Candidate for import. Final checks will run on the server.",
    "final.text.145": "Importing media into PostgreSQL...",
    "final.text.146": "Loading titles...",
    "final.text.147": "Please log in to My List to load the catalog.",
    "final.text.148": "Unable to load the media catalog.",
    "final.text.149": "Invalid catalog response.",
    "final.text.150": "No titles available",
    "final.text.151": "Select a value",
    "final.text.152": "Joy",
    "final.text.153": "Comfort",
    "final.text.154": "Peace",
    "final.text.155": "Inspiration",
    "final.text.156": "Excitement",
    "final.text.157": "Energy",
    "final.text.158": "Happiness, amusement, delight",
    "final.text.159": "Warmth, reassurance, emotional safety",
    "final.text.160": "Relaxation, tranquility, reduced tension",
    "final.text.161": "Motivation, hope, encouragement",
    "final.text.162": "Suspense, anticipation, excitement",
    "final.text.163": "Stimulation, enthusiasm, activation",
    "final.text.164": "Intensity",
    "final.text.165": "Confidence",
    "final.text.166": "0 — None",
    "final.text.167": "1 — Weak",
    "final.text.168": "2 — Moderate",
    "final.text.169": "3 — Strong",
    "final.text.170": "1 — Low",
    "final.text.171": "2 — Medium",
    "final.text.172": "3 — High",
    "final.text.173": "Annotation Preview ✦",
    "final.text.174": "Media:",
    "final.text.175": "Catalog ID:",
    "final.text.176": "Evidence source:",
    "final.text.177": "Server validation: Passed ✓",
    "final.text.178": "Emotion",
    "final.text.179":
      "Preview only. Your answers passed server validation but have not been saved.",
    "final.text.180": "Invalid selection",
    "final.text.181": "Please select a media item from the catalog.",
    "final.text.182": "CHECKING...",
    "final.text.183": "Please check your answers",
    "final.text.184": "Invalid annotation data.",
    "final.text.185": "Your session has expired. Please log in again.",
    "final.text.186": "Unable to validate your annotation.",
    "final.text.187": "Unexpected validation response.",
    "final.text.188": "Validation unavailable",
    "final.text.189": "Please try again.",
    "final.text.190": "Research Preview Document",
    "final.text.191":
      "This document is provided for demonstration only. Reviewing it does not constitute formal research consent.",
    "final.text.192":
      "You do not have permission to view this research document.",
    "final.text.193": "Unable to load the research preview document.",
    "final.text.194": "Unexpected research document response.",
    "final.text.195": "Checking your research participation status...",
    "final.text.196":
      "Please log in to My List to access the research form preview.",
    "final.text.197": "Unable to verify research participation.",
    "final.text.198":
      "You have not been invited to participate in this research.",
    "final.text.199":
      "Your research participation has been withdrawn. The annotation form is no longer available.",
    "final.text.200":
      "Research form access is not available for your current participation status.",
    "final.text.201": "Loading the research preview document...",
    "final.text.202":
      "You have a research invitation. Please review the preview document before continuing. This is not formal research consent.",
    "final.text.203":
      "Test participation confirmed. Please review the preview document before continuing. This is not formal research consent.",
    "final.text.204": "Unable to prepare the research preview.",
    "final.text.205": "Research preview document has not been loaded.",
    "final.text.206": "Unable to record preview acknowledgement.",
    "final.text.207": "Unexpected preview acknowledgement response.",
    "final.text.208": "RECORDING PREVIEW ACKNOWLEDGEMENT...",
    "final.text.209": "Recording your test acknowledgement...",
    "final.text.210":
      "Your test acknowledgement has been recorded. This is not formal research consent. Your annotation answers will not be saved.",
    "final.text.211":
      "Your test acknowledgement was already recorded. No duplicate event was created. Your annotation answers will not be saved.",
    "final.text.212": "Please refresh the page.",
    "final.text.213": "Unable to record acknowledgement. Please try again.",
  });

  // Compass Watch Reminder
  Object.assign(translations.uk, {
    "compass.watch.button": "Де подивитися?",
    "compass.watch.region": "Країна: ",
    "compass.watch.norway": "Норвегія",
    "compass.watch.ukraine": "Україна",
    "compass.watch.loading": "Завантажуємо доступні платформи…",
    "compass.watch.loadError": "Не вдалося завантажити платформи.",
    "compass.watch.subscription": "За підпискою",
    "compass.watch.free": "Безкоштовно",
    "compass.watch.ads": "З рекламою",
    "compass.watch.rent": "Оренда",
    "compass.watch.buy": "Купівля",
    "compass.watch.none":
      "Для цієї країни TMDB не має підтверджених варіантів перегляду.",
    "compass.watch.open": "Відкрити варіанти перегляду на TMDB ↗",
    "compass.watch.attribution":
      "Дані про доступність: JustWatch через TMDB. Список може змінюватися. Посилання веде на TMDB, не безпосередньо до відео.",
    "compass.watch.genericError": "Помилка завантаження.",
    "compass.reminder.question": "Ти вже переглянув(-ла) «{title}»?",
    "compass.reminder.description":
      "Ти відкривав(-ла) варіанти перегляду. Якщо вже подивився(-лася), оціни точність рекомендації Compass.",
    "compass.reminder.yes": "Так, оцінити",
    "compass.reminder.later": "Ще не дивився(-лася)",
    "compass.reminder.dismiss": "Не нагадувати",
    "compass.reminder.watched": "Переглянуто",
    "compass.reminder.fit": "Наскільки точно Compass підібрав твір? ",
    "compass.reminder.achieved": "Чи відчув(-ла) ти бажану емоцію? ",
    "compass.reminder.unspecified": "Не вказано",
    "compass.reminder.answerYes": "Так",
    "compass.reminder.answerNo": "Ні",
    "compass.reminder.confirm": "Підтвердити перегляд",
    "compass.reminder.saving": "Зберігаємо…",
    "compass.reminder.saved":
      "Додано до My List (Completed). Оцінку фільму, думку та обкладинку можна додати в бібліотеці.",
    "compass.reminder.saveError": "Не вдалося зберегти перегляд.",
    "compass.reminder.genreLabel": "Жанри: {genres}",
  });
  Object.assign(translations.en, {
    "compass.watch.button": "Where to watch?",
    "compass.watch.region": "Country: ",
    "compass.watch.norway": "Norway",
    "compass.watch.ukraine": "Ukraine",
    "compass.watch.loading": "Loading available services…",
    "compass.watch.loadError": "Could not load viewing services.",
    "compass.watch.subscription": "Subscription",
    "compass.watch.free": "Free",
    "compass.watch.ads": "With ads",
    "compass.watch.rent": "Rent",
    "compass.watch.buy": "Buy",
    "compass.watch.none":
      "TMDB has no confirmed viewing options for this country.",
    "compass.watch.open": "Open viewing options on TMDB ↗",
    "compass.watch.attribution":
      "Availability data: JustWatch via TMDB. Services may change. The link opens TMDB, not the video itself.",
    "compass.watch.genericError": "Unable to load data.",
    "compass.reminder.question": "Have you watched “{title}”?",
    "compass.reminder.description":
      "You opened the viewing options. If you have watched it, rate how well Compass matched your desired emotion.",
    "compass.reminder.yes": "Yes, rate it",
    "compass.reminder.later": "Not watched yet",
    "compass.reminder.dismiss": "Do not remind me",
    "compass.reminder.watched": "Watched",
    "compass.reminder.fit": "How accurately did Compass recommend this title? ",
    "compass.reminder.achieved": "Did you feel the desired emotion? ",
    "compass.reminder.unspecified": "Not specified",
    "compass.reminder.answerYes": "Yes",
    "compass.reminder.answerNo": "No",
    "compass.reminder.confirm": "Confirm watched",
    "compass.reminder.saving": "Saving…",
    "compass.reminder.saved":
      "Added to My List (Completed). You can add your own rating, review, and cover image in the library.",
    "compass.reminder.saveError": "Unable to save watched status.",
    "compass.reminder.genreLabel": "Genres: {genres}",
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

  window.MyListPageTextKeys = {
    "Catalog Administration | MyList Compass": "final.text.0",
    "Catalog Administration": "final.text.1",
    "Search TMDB and manage the research media catalog.": "final.text.2",
    "← Back to MyList": "final.text.3",
    "Checking administrator permissions...": "final.text.4",
    "Search TMDB": "final.text.5",
    "Find movies or television series in TMDB.": "final.text.6",
    "Media type": "final.text.7",
    Movie: "final.text.8",
    Series: "final.text.9",
    Title: "final.text.10",
    Search: "final.text.11",
    "Search Results": "final.text.12",
    "Media Preview": "final.text.13",
    "Catalog Matching": "final.text.14",
    "Preview only. No changes will be made to PostgreSQL.": "final.text.15",
    "Enter a movie or series title": "final.text.16",
    "Emotional Research | MyList Compass": "final.text.17",
    "← Back to My List": "final.text.18",
    "RESEARCH PREVIEW": "final.text.19",
    "EMOTIONAL ANNOTATION STUDY": "final.text.20",
    "Every story makes us": "final.text.21",
    "feel something.": "final.text.22",
    "Help us understand the emotional experiences associated with movies and television series.":
      "final.text.23",
    "Preview mode.": "final.text.24",
    "Your answers are sent to the server for validation but are not saved as research annotations. Research participation and formal consent are not yet enabled.":
      "final.text.25",
    "Before we begin": "final.text.26",
    "Please read the information about the proposed research.": "final.text.27",
    "About this research": "final.text.28",
    "MyList Compass is a research project exploring how emotional characteristics of movies and television series can support personalized recommendations.":
      "final.text.29",
    "What would you do?": "final.text.30",
    "Participants would select a movie or series they are familiar with and evaluate six emotional characteristics: Joy, Comfort, Peace, Inspiration, Excitement, and Energy.":
      "final.text.31",
    "Each characteristic is evaluated using an intensity scale from 0 to 3 and a confidence scale from 1 to 3.":
      "final.text.32",
    "Do you need to watch every movie?": "final.text.33",
    "No. Participants would only evaluate titles they are familiar with. There is no requirement to watch unfamiliar movies or television series.":
      "final.text.34",
    "Assessments based on watching a title and expectations based on a trailer or synopsis represent different kinds of evidence. These sources would be distinguished during research analysis.":
      "final.text.35",
    "What information would be collected?": "final.text.36",
    "The proposed study would collect the selected media item, emotional ratings, confidence levels, evidence source, and optional comments.":
      "final.text.37",
    "Research records would be associated with a pseudonymous participant code linked to an authorized My List account.":
      "final.text.38",
    "How would the information be used?": "final.text.39",
    "Research data would support the development of an emotional media dataset, comparison of annotator assessments, and evaluation of recommendation algorithms.":
      "final.text.40",
    "Evaluations based on full viewing would be distinguished from predictions based on trailers or descriptions.":
      "final.text.41",
    "Is participation voluntary?": "final.text.42",
    "Yes. Participation in the planned study would be voluntary and separate from normal use of My List.":
      "final.text.43",
    "Participants would be able to withdraw according to the procedure described in the finalized research information.":
      "final.text.44",
    "Important:": "final.text.45",
    "This is draft research information. Research contacts, data retention, withdrawal procedures, and final participation terms must be confirmed before inviting real participants. No formal research consent is collected here.":
      "final.text.46",
    "I have read this draft information and want to continue testing the annotation form.":
      "final.text.47",
    "CONTINUE TO FORM PREVIEW →": "final.text.48",
    "Choose your story": "final.text.49",
    "Select a title and tell us what your assessment is based on.":
      "final.text.50",
    "Movie or series": "final.text.51",
    "Select a title": "final.text.52",
    "Choose a title you know. If none of the available titles are familiar, you do not need to complete this form.":
      "final.text.53",
    "What is your assessment based on?": "final.text.54",
    "Select a source": "final.text.55",
    "I watched it": "final.text.56",
    "I watched the trailer": "final.text.57",
    "I read the synopsis": "final.text.58",
    "If you watched the title, rate your assessment of its emotional characteristics. If you only saw a trailer or read a synopsis, rate what you expect from that information. Do not present an expectation as a personal viewing experience.":
      "final.text.59",
    "How to evaluate emotions": "final.text.60",
    "Please read these instructions before answering.": "final.text.61",
    "What are you evaluating?": "final.text.62",
    "Think about the overall emotional impression associated with the selected movie or series.":
      "final.text.63",
    "Evaluate how strongly you associate the story with each emotion. Focus on your own impression or expectation, rather than simply identifying which emotions the characters express.":
      "final.text.64",
    "You are not being asked to measure a change in your actual mood before and after watching.":
      "final.text.65",
    "Important rules": "final.text.66",
    "Evaluate independently.": "final.text.67",
    "Each emotional category should be assessed separately. A movie can score highly in several categories.":
      "final.text.68",
    "There are no correct answers.": "final.text.69",
    "Emotional impressions can differ between people.": "final.text.70",
    "Do not guess your confidence.": "final.text.71",
    "If you remember the story poorly or have limited information, select a lower confidence level.":
      "final.text.72",
    "Zero is a valid answer.": "final.text.73",
    "Choose intensity 0 when you do not associate the title with a particular emotional characteristic.":
      "final.text.74",
    "Emotional characteristics": "final.text.75",
    "Evaluate each emotional category independently.": "final.text.76",
    "Intensity scale": "final.text.77",
    "0 — None:": "final.text.78",
    "The emotion is absent or not noticeable.": "final.text.79",
    "1 — Weak:": "final.text.80",
    "The emotion is slightly noticeable.": "final.text.81",
    "2 — Moderate:": "final.text.82",
    "The emotion is чітко noticeable.": "final.text.83",
    "The emotion is clearly noticeable.": "final.text.84",
    "3 — Strong:": "final.text.85",
    "The emotion is strongly expressed.": "final.text.86",
    "Confidence scale": "final.text.87",
    "1 — Low:": "final.text.88",
    "You are uncertain about your assessment.": "final.text.89",
    "2 — Medium:": "final.text.90",
    "You are reasonably confident.": "final.text.91",
    "3 — High:": "final.text.92",
    "You are very confident in your assessment.": "final.text.93",
    "Emotion definitions": "final.text.94",
    "😊 Joy": "final.text.95",
    "Happiness, amusement, delight, or a cheerful emotional impression.":
      "final.text.96",
    "💜 Comfort": "final.text.97",
    "Emotional warmth, reassurance, support, or a feeling of emotional safety.":
      "final.text.98",
    "🌙 Peace": "final.text.99",
    "Calmness, relaxation, tranquility, or reduced emotional tension.":
      "final.text.100",
    "✨ Inspiration": "final.text.101",
    "Hope, motivation, encouragement, or a desire for positive change.":
      "final.text.102",
    "⚡ Excitement": "final.text.103",
    "Suspense, anticipation, tension, or an exciting emotional experience.":
      "final.text.104",
    "🔥 Energy": "final.text.105",
    "Enthusiasm, stimulation, alertness, or a feeling of increased activity.":
      "final.text.106",
    "Additional notes": "final.text.107",
    "This section is optional.": "final.text.108",
    "Would you like to explain your assessment?": "final.text.109",
    "Share your thoughts about the emotional experience...": "final.text.110",
    "Please do not include names, contact details, or other personal information in your notes.":
      "final.text.111",
    "CLEAR ANSWERS": "final.text.112",
    "CHECK ANSWERS →": "final.text.113",
    "MYLIST COMPASS ✦ RESEARCH PROJECT": "final.text.114",
    Unknown: "final.text.115",
    "Unknown year": "final.text.116",
    "Unknown media": "final.text.117",
    "Import to Catalog": "final.text.118",
    "This action creates a new media record in PostgreSQL. Genres will be linked, but emotional assessments will not be created.":
      "final.text.119",
    "Type IMPORT to confirm:": "final.text.120",
    "Reviewing media does not change PostgreSQL. A confirmed import creates a new catalog record.":
      "final.text.121",
    "Administrator access required.": "final.text.122",
    "Administrator access granted. Catalog tools are available.":
      "final.text.123",
    "No results found.": "final.text.124",
    Review: "final.text.125",
    "Enter a title containing 2–100 characters.": "final.text.126",
    "Searching TMDB...": "final.text.127",
    "Unexpected search response.": "final.text.128",
    "Found {total} results. Showing {count} on the first page.":
      "final.text.129",
    "Loading media details...": "final.text.130",
    "Unexpected media review response.": "final.text.131",
    Category: "final.text.132",
    Year: "final.text.133",
    Duration: "final.text.134",
    minutes: "final.text.135",
    Genres: "final.text.136",
    Description: "final.text.137",
    "No description": "final.text.138",
    "Match status": "final.text.139",
    "Title variants checked": "final.text.140",
    "No matching entries found in the local catalog.": "final.text.141",
    "Local ID": "final.text.142",
    Reason: "final.text.143",
    "Candidate for import. Final checks will run on the server.":
      "final.text.144",
    "Importing media into PostgreSQL...": "final.text.145",
    "Loading titles...": "final.text.146",
    "Please log in to My List to load the catalog.": "final.text.147",
    "Unable to load the media catalog.": "final.text.148",
    "Invalid catalog response.": "final.text.149",
    "No titles available": "final.text.150",
    "Select a value": "final.text.151",
    Joy: "final.text.152",
    Comfort: "final.text.153",
    Peace: "final.text.154",
    Inspiration: "final.text.155",
    Excitement: "final.text.156",
    Energy: "final.text.157",
    "Happiness, amusement, delight": "final.text.158",
    "Warmth, reassurance, emotional safety": "final.text.159",
    "Relaxation, tranquility, reduced tension": "final.text.160",
    "Motivation, hope, encouragement": "final.text.161",
    "Suspense, anticipation, excitement": "final.text.162",
    "Stimulation, enthusiasm, activation": "final.text.163",
    Intensity: "final.text.164",
    Confidence: "final.text.165",
    "0 — None": "final.text.166",
    "1 — Weak": "final.text.167",
    "2 — Moderate": "final.text.168",
    "3 — Strong": "final.text.169",
    "1 — Low": "final.text.170",
    "2 — Medium": "final.text.171",
    "3 — High": "final.text.172",
    "Annotation Preview ✦": "final.text.173",
    "Media:": "final.text.174",
    "Catalog ID:": "final.text.175",
    "Evidence source:": "final.text.176",
    "Server validation: Passed ✓": "final.text.177",
    Emotion: "final.text.178",
    "Preview only. Your answers passed server validation but have not been saved.":
      "final.text.179",
    "Invalid selection": "final.text.180",
    "Please select a media item from the catalog.": "final.text.181",
    "CHECKING...": "final.text.182",
    "Please check your answers": "final.text.183",
    "Invalid annotation data.": "final.text.184",
    "Your session has expired. Please log in again.": "final.text.185",
    "Unable to validate your annotation.": "final.text.186",
    "Unexpected validation response.": "final.text.187",
    "Validation unavailable": "final.text.188",
    "Please try again.": "final.text.189",
    "Research Preview Document": "final.text.190",
    "This document is provided for demonstration only. Reviewing it does not constitute formal research consent.":
      "final.text.191",
    "You do not have permission to view this research document.":
      "final.text.192",
    "Unable to load the research preview document.": "final.text.193",
    "Unexpected research document response.": "final.text.194",
    "Checking your research participation status...": "final.text.195",
    "Please log in to My List to access the research form preview.":
      "final.text.196",
    "Unable to verify research participation.": "final.text.197",
    "You have not been invited to participate in this research.":
      "final.text.198",
    "Your research participation has been withdrawn. The annotation form is no longer available.":
      "final.text.199",
    "Research form access is not available for your current participation status.":
      "final.text.200",
    "Loading the research preview document...": "final.text.201",
    "You have a research invitation. Please review the preview document before continuing. This is not formal research consent.":
      "final.text.202",
    "Test participation confirmed. Please review the preview document before continuing. This is not formal research consent.":
      "final.text.203",
    "Unable to prepare the research preview.": "final.text.204",
    "Research preview document has not been loaded.": "final.text.205",
    "Unable to record preview acknowledgement.": "final.text.206",
    "Unexpected preview acknowledgement response.": "final.text.207",
    "RECORDING PREVIEW ACKNOWLEDGEMENT...": "final.text.208",
    "Recording your test acknowledgement...": "final.text.209",
    "Your test acknowledgement has been recorded. This is not formal research consent. Your annotation answers will not be saved.":
      "final.text.210",
    "Your test acknowledgement was already recorded. No duplicate event was created. Your annotation answers will not be saved.":
      "final.text.211",
    "Please refresh the page.": "final.text.212",
    "Unable to record acknowledgement. Please try again.": "final.text.213",
  };

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
