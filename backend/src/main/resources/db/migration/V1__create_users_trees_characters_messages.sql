-- V1: PokeLetter 초기 스키마 (docs/product/erd.md)
-- 포켓몬 데이터는 이 파일이 아니라 시드 스크립트로 넣는다 (POL-IP-04)

-- 트리 주인 계정. 이메일·이름 같은 개인정보 컬럼은 두지 않는다 (POL-PRV-01)
CREATE TABLE users (
    id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    provider         varchar(10)  NOT NULL,
    provider_user_id varchar(255) NOT NULL,
    created_at       timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT ck_users_provider CHECK (provider IN ('GOOGLE', 'KAKAO', 'NAVER')),
    CONSTRAINT uk_users_provider_user UNIQUE (provider, provider_user_id)
);

-- 크리스마스 트리. owner_id UNIQUE로 1인 1트리를 보장한다 (POL-TRE-01)
CREATE TABLE trees (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id  varchar(10) NOT NULL,
    owner_id   bigint      NOT NULL,
    name       varchar(20) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uk_trees_public_id UNIQUE (public_id),
    CONSTRAINT uk_trees_owner_id UNIQUE (owner_id),
    CONSTRAINT fk_trees_owner FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT ck_trees_public_id CHECK (public_id ~ '^[A-Za-z0-9]{10}$'),
    CONSTRAINT ck_trees_name_not_blank CHECK (btrim(name) <> '')
);

-- 캐릭터 팩. id는 시드 스크립트가 규칙으로 정하고 바꾸지 않는다 (메시지가 참조)
-- form: base 또는 리전폼. 한 지역에 폼이 여럿이면 접미사로 구분한다 (예: paldea-combat)
CREATE TABLE characters (
    id         integer      PRIMARY KEY,
    pack       varchar(20)  NOT NULL,
    dex_no     integer      NOT NULL,
    form       varchar(20)  NOT NULL DEFAULT 'base',
    name_ko    varchar(50)  NOT NULL,
    image_url  varchar(500) NOT NULL,
    generation smallint     NOT NULL,
    type1      varchar(10)  NOT NULL,
    type2      varchar(10),
    sort_order integer      NOT NULL,
    active     boolean      NOT NULL DEFAULT true,
    CONSTRAINT uk_characters_pack_dex_form UNIQUE (pack, dex_no, form),
    CONSTRAINT ck_characters_dex_no CHECK (dex_no > 0),
    CONSTRAINT ck_characters_generation CHECK (generation BETWEEN 1 AND 9),
    CONSTRAINT ck_characters_types CHECK (type2 IS NULL OR type2 <> type1)
);

-- 메시지 = 트리의 장식. 트리가 지워지면 함께 지운다 (POL-PRV-03)
-- 닉네임과 내용은 마스킹한 뒤에 저장한다 (POL-FLT-03)
CREATE TABLE messages (
    id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tree_id          bigint       NOT NULL,
    nickname         varchar(10)  NOT NULL,
    content          varchar(500) NOT NULL,
    character_id     integer      NOT NULL,
    selection_type   varchar(10)  NOT NULL,
    decoration_style smallint     NOT NULL,
    created_at       timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT fk_messages_tree FOREIGN KEY (tree_id) REFERENCES trees (id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_character FOREIGN KEY (character_id) REFERENCES characters (id),
    CONSTRAINT ck_messages_selection_type CHECK (selection_type IN ('CHOSEN', 'RANDOM')),
    CONSTRAINT ck_messages_nickname_not_blank CHECK (btrim(nickname) <> ''),
    CONSTRAINT ck_messages_content_not_blank CHECK (btrim(content) <> ''),
    -- 장식 모양 범위는 디자인 확정 후 V2에서 좁힌다
    CONSTRAINT ck_messages_decoration_style CHECK (decoration_style >= 0)
);

-- 트리 화면 조회와 페이지 넘김 (POL-TRE-04)
CREATE INDEX ix_messages_tree_created ON messages (tree_id, created_at);
-- 랜덤 후보 계산과 받은 포켓몬 모아보기 (POL-CHR-03, 05)
CREATE INDEX ix_messages_tree_character ON messages (tree_id, character_id);
