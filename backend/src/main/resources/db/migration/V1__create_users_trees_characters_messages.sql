-- V1: PokeLetter 초기 스키마 (docs/product/erd.md). MySQL 8.0.16 이상 (CHECK 제약)
-- 포켓몬·볼 데이터는 이 파일이 아니라 시드 명령으로 넣는다 (POL-IP-04)
--
-- 문자셋은 utf8mb4. varchar(n)은 글자 수 기준이라 한글·이모지 길이 제한과 맞는다.
-- 기본 콜레이션(utf8mb4_0900_ai_ci)은 대소문자를 구분하지 않으므로, 대소문자가 다른 값을 구분해야 하는
-- 컬럼(공유 ID, 제공자 고유 ID, 볼 아이템 키)은 utf8mb4_bin으로 둔다.
-- 시각은 DATETIME(6)에 UTC로 저장한다 (애플리케이션 hibernate.jdbc.time_zone = UTC).

-- 트리 주인 계정. 이메일·이름 같은 개인정보 컬럼은 두지 않는다 (POL-PRV-01)
CREATE TABLE users (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    provider         VARCHAR(10)  NOT NULL,
    provider_user_id VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    created_at       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT ck_users_provider CHECK (provider IN ('GOOGLE', 'KAKAO', 'NAVER')),
    CONSTRAINT uk_users_provider_user UNIQUE (provider, provider_user_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- 크리스마스 트리. owner_id UNIQUE로 1인 1트리를 보장한다 (POL-TRE-01)
CREATE TABLE trees (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    public_id  VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    owner_id   BIGINT      NOT NULL,
    name       VARCHAR(20) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_trees PRIMARY KEY (id),
    CONSTRAINT uk_trees_public_id UNIQUE (public_id),
    CONSTRAINT uk_trees_owner_id UNIQUE (owner_id),
    CONSTRAINT fk_trees_owner FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT ck_trees_public_id CHECK (REGEXP_LIKE(public_id, '^[A-Za-z0-9]{10}$', 'c')),
    CONSTRAINT ck_trees_name_not_blank CHECK (TRIM(name) <> '')
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- 캐릭터 팩. id는 시드 명령이 규칙(도감 번호 × 100 + 폼 번호)으로 정하고 바꾸지 않는다 (메시지가 참조)
-- form: base 또는 리전폼. 한 지역에 폼이 여럿이면 접미사로 구분한다 (예: paldea-combat)
-- 리전폼은 코드로만 구분하고, name_ko는 원래 이름 그대로 쓴다 (알로라 라이츄 → "라이츄")
CREATE TABLE characters (
    id         INT          NOT NULL,
    pack       VARCHAR(20)  NOT NULL,
    dex_no     INT          NOT NULL,
    form       VARCHAR(20)  NOT NULL DEFAULT 'base',
    name_ko    VARCHAR(50)  NOT NULL,
    image_url  VARCHAR(500) NOT NULL,
    generation SMALLINT     NOT NULL,
    type1      VARCHAR(10)  NOT NULL,
    type2      VARCHAR(10),
    sort_order INT          NOT NULL,
    active     BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_characters PRIMARY KEY (id),
    CONSTRAINT uk_characters_pack_dex_form UNIQUE (pack, dex_no, form),
    CONSTRAINT ck_characters_dex_no CHECK (dex_no > 0),
    CONSTRAINT ck_characters_generation CHECK (generation BETWEEN 1 AND 9),
    CONSTRAINT ck_characters_types CHECK (type2 IS NULL OR type2 <> type1)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- 장식용 볼. 작성자가 고른다. id는 PokéAPI 아이템 id를 그대로 써서 다시 시드해도 바뀌지 않는다
-- 화면 이름은 name_ko. 일반 볼과 이름이 겹치는 히스이 볼은 "몬스터볼(히스이)"처럼 표기한다
CREATE TABLE balls (
    id         INT          NOT NULL,
    item_key   VARCHAR(30)  CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    name_ko    VARCHAR(30)  NOT NULL,
    image_url  VARCHAR(500) NOT NULL,
    sort_order INT          NOT NULL,
    active     BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_balls PRIMARY KEY (id),
    CONSTRAINT uk_balls_item_key UNIQUE (item_key)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- 메시지 = 트리의 장식. 트리가 지워지면 함께 지운다 (POL-PRV-03)
-- 닉네임과 내용은 마스킹한 뒤에 저장한다 (POL-FLT-03)
CREATE TABLE messages (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    tree_id        BIGINT       NOT NULL,
    nickname       VARCHAR(10)  NOT NULL,
    content        VARCHAR(500) NOT NULL,
    character_id   INT          NOT NULL,
    selection_type VARCHAR(10)  NOT NULL,
    ball_id        INT          NOT NULL,
    created_at     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_messages PRIMARY KEY (id),
    CONSTRAINT fk_messages_tree FOREIGN KEY (tree_id) REFERENCES trees (id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_character FOREIGN KEY (character_id) REFERENCES characters (id),
    CONSTRAINT fk_messages_ball FOREIGN KEY (ball_id) REFERENCES balls (id),
    CONSTRAINT ck_messages_selection_type CHECK (selection_type IN ('CHOSEN', 'RANDOM')),
    CONSTRAINT ck_messages_nickname_not_blank CHECK (TRIM(nickname) <> ''),
    CONSTRAINT ck_messages_content_not_blank CHECK (TRIM(content) <> ''),
    -- 트리 화면 조회와 페이지 넘김 (POL-TRE-04)
    INDEX ix_messages_tree_created (tree_id, created_at),
    -- 랜덤 후보 계산과 받은 포켓몬 모아보기 (POL-CHR-03, 05)
    INDEX ix_messages_tree_character (tree_id, character_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
