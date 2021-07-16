class Room {
  static JOINED = "event:joined_room";
  static FETCH_USER_RECORDS = "event:fetch_user_records";
  static USER_RECORD_LIST = "event:user_record_list";
  static MEMBER_ADD = "event:member_add";
  static MEMBER_LEFT = "event:member_left";
}

class Game {
  static REQUEST_START_GAME = "event:request_start_game";
  static START_GAME = "event:start_game";
  static LEAVE_GAME = "event:leave_game";

  static REQUEST_GAME_SCREEN_STATE = "event:request_game_screen_state";
  static GAME_SCREEN_STATE_RESULT = "event:game_screen_state_result";

  static REQUEST_LIST_OF_WORD = "request:list_of_words";
  static LIST_OF_WORD_RESPONSE = "response:list_of_word";

  static REQUEST_SELECT_WORD = "request:select_word";

  static DRAWING_EVENT = "event:drawing";

  static ANSWER_REQUEST = "request:answer";
  static ANSWER_RESPONSE = "response:answer";

  static WORD_GUESS_EVENT = "event:word_guess";
}

export default { Room, Game };
