# siyuan-mcp-server

[English](./README.md) | [简体中文](./README_zh-CN.md) | [繁體中文](./README_zh-TW.md) | [Español](./README_es.md) | [한국어](./README_ko.md)

`siyuan-mcp-server`는 MCP를 지원하는 AI 클라이언트가 SiYuan 노트에 직접 접근할 수 있게 해 주는 로컬 `stdio` MCP 서버입니다. 이 저장소에는 로컬 스킬을 지원하는 에이전트를 위한 선택형 companion skill도 함께 포함되어 있습니다. 설정을 마치면 Claude Code, Cursor, Codex CLI 같은 도구에 연결해서 에이전트가 노트를 읽고, 찾고, 재구성하고, 수정하게 할 수 있습니다. 즉, SiYuan을 단순 저장소가 아니라 에이전트가 실제로 작업할 수 있는 개인 지식 베이스로 바꿔 줍니다.

## 무엇에 도움이 되나

연결이 끝나면 에이전트는 단일 노트만 읽는 데 그치지 않습니다. 여러 노트를 함께 다루며 지식 베이스 전체의 문맥을 복원할 수 있습니다. 가치가 큰 사용 사례는 다음과 같습니다.

- 일일 노트, 주간 보고, 회의록, 프로젝트 문서를 바탕으로 프로젝트의 흐름을 재구성하기
- 이미 작성한 내용을 바탕으로 진행 상황, 위험, 결정 사항, 미완료 작업을 요약하기
- 흩어져 있는 메모, 약속, 결론을 하나의 실행 가능한 결과물로 정리하기
- 빈 문서에서 새로 시작하는 대신 기존 초안을 실제 맥락 위에서 이어서 작성하기
- GUI에서 일일이 클릭하지 않고 노트북, 문서, 블록 구조를 정리하기

대부분의 사용자는 SQL을 직접 작성하거나 블록 속성을 직접 관리할 필요가 없습니다. 원하는 결과를 설명하면 에이전트가 적절한 도구를 호출합니다.

예를 들면 다음과 같습니다.

- "지난 30일 동안 Project Alpha와 관련된 일일 노트, 주간 보고, 회의록을 모두 검토해서 주요 의사결정, 현재 위험, 미해결 항목, 다음 단계를 포함한 진행 요약을 만들어줘."
- "최근 2주간의 회의록과 업무 로그를 연결해서 반복적으로 등장한 문제, 반복되는 액션 아이템, 아직 마감되지 않은 약속을 찾아줘."
- "최근의 제품 노트, 요구사항 초안, 주간 보고를 바탕으로 현재 로드맵 초안을 정리하고, 각 주요 결론이 어떤 문서에 근거하는지 표시해줘."
- "이 고객에 대한 최근 노트를 모두 찾아서 배경, 커뮤니케이션 이력, 약속, 후속 조치를 시간순으로 정리해줘."
- "이 주제에 흩어져 있는 자료를 모아서 더 명확한 구조의 요약으로 다시 쓰고, 결과를 대상 문서 끝에 추가해줘."

## 설치

### 요구 사항

- Node.js 18 이상
- 실행 중인 SiYuan 인스턴스
- 유효한 SiYuan API 토큰

토큰은 SiYuan의 `Settings -> About -> API Token`에서 확인할 수 있습니다.

### 코드 받기

```bash
git clone https://github.com/unclemicdo/siyuan-mcp-server.git
cd siyuan-mcp-server
```

### 의존성 설치 및 빌드

```bash
npm install
npm run build
```

안정적인 실행 경로는 로컬 빌드 산출물인 `dist/index.js`입니다.

### 자동 설치

사용 중인 에이전트나 클라이언트가 MCP 관리 명령을 지원한다면 설정을 자동으로 추가하게 할 수 있습니다. 아래 명령은 직접 실행해도 됩니다.

아래 예시는 `npm install`과 `npm run build`를 이미 실행했고, `/path/to/siyuan-mcp-server`를 실제 절대 경로로 바꿨다고 가정합니다.

#### Claude Code

```bash
claude mcp add -e SIYUAN_TOKEN=your-siyuan-api-token-here siyuan -- node /path/to/siyuan-mcp-server/dist/index.js
```

다른 포트나 호스트가 필요하면 `-e SIYUAN_BASE_URL=http://127.0.0.1:6807`를 추가하세요.

#### Codex CLI

```bash
codex mcp add siyuan --env SIYUAN_TOKEN=your-siyuan-api-token-here -- node /path/to/siyuan-mcp-server/dist/index.js
```

기본 포트나 주소를 바꾸려면 `SIYUAN_BASE_URL`을 추가 환경 변수로 넘기면 됩니다.

예:

```bash
codex mcp add siyuan \
  --env SIYUAN_TOKEN=your-siyuan-api-token-here \
  --env SIYUAN_BASE_URL=http://127.0.0.1:6807 \
  -- node /path/to/siyuan-mcp-server/dist/index.js
```

### 수동 설치

설정 파일을 직접 관리하고 싶거나, 사용하는 클라이언트에 추가 명령이 없다면 아래 방법 중 하나를 사용하세요.

#### Claude Code

수동 `~/.claude.json`:

```json
{
  "mcpServers": {
    "siyuan": {
      "command": "node",
      "args": ["/path/to/siyuan-mcp-server/dist/index.js"],
      "env": {
        "SIYUAN_TOKEN": "your-siyuan-api-token-here"
      }
    }
  }
}
```

#### Claude Desktop

설정 파일을 편집하세요:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\\Claude\\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "siyuan": {
      "command": "node",
      "args": ["/path/to/siyuan-mcp-server/dist/index.js"],
      "env": {
        "SIYUAN_TOKEN": "your-siyuan-api-token-here"
      }
    }
  }
}
```

#### Cursor

프로젝트 루트에 `.cursor/mcp.json`을 만드세요:

```json
{
  "mcpServers": {
    "siyuan": {
      "command": "node",
      "args": ["/path/to/siyuan-mcp-server/dist/index.js"],
      "env": {
        "SIYUAN_TOKEN": "your-siyuan-api-token-here"
      }
    }
  }
}
```

### 환경 변수

| 변수 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `SIYUAN_TOKEN` | 예 | none | SiYuan API 토큰 |
| `SIYUAN_BASE_URL` | 아니오 | `http://127.0.0.1:6806` | SiYuan 기본 URL, 비로컬 대상은 시작 시 경고 표시 |

### 설정 후 검증

설치와 클라이언트 설정이 끝났다면 최소 한 번은 로컬 검증을 실행하는 것이 좋습니다.

```bash
npm test
```

프로토콜을 대화형으로 확인하려면:

```bash
SIYUAN_TOKEN=your_token npx @modelcontextprotocol/inspector node dist/index.js
```

### 선택형 companion skill

이 저장소에는 `skills/siyuan-mcp-skill/` 경로에 선택형 companion skill도 함께 들어 있습니다.

이 skill은 새로운 MCP 도구를 추가하지 않습니다. 대신 기존 SiYuan 도구를 검색, 추적, 요약, 안전한 쓰기 작업에 더 안정적으로 사용하도록 에이전트를 안내합니다.

사용 중인 에이전트가 로컬 skill을 지원한다면 skill 디렉터리로 복사해서 설치할 수 있습니다. Codex 스타일 환경에서는 다음과 같습니다.

```bash
mkdir -p ~/.agents/skills
rm -rf ~/.agents/skills/siyuan-mcp-skill
cp -R skills/siyuan-mcp-skill ~/.agents/skills/
```

설치 후 skill 명시 호출을 지원하는 환경에서는 다음처럼 사용할 수 있습니다.

- Codex 스타일: `$siyuan-mcp-skill`
- Claude Code 스타일: `/siyuan-mcp-skill`

여러 노트에서 정보를 찾고, 타임라인을 추적하고, 기존 문서를 이어 쓰고, 이 MCP에서 더 안전하게 쓰기 결정을 내리고 싶을 때 사용하세요.

## 기능

현재 서버는 다음 범주에 걸쳐 22개의 도구를 제공합니다.

| 범주 | 개수 | 설명 |
| --- | --- | --- |
| 노트북 관리 | 5 | 노트북 목록, 생성, 열기, 닫기, 이름 변경 |
| 문서 작업 | 5 | 문서 생성, 이름 변경, 삭제, 이동, Markdown 내보내기 |
| 블록 작업 | 7 | 블록 삽입, 추가, 수정, 삭제, 조회 |
| 블록 속성 | 2 | 사용자 정의 블록 메타데이터 읽기/쓰기 |
| SQL 조회 | 1 | 읽기 전용 `SELECT` 조회 |
| 시스템 도구 | 2 | 버전 정보 조회, 알림 푸시 |

일반 사용자 관점에서 보면 주로 다음을 의미합니다.

- 제목, 태그, 수정 시각, 내용 범위로 원하는 내용을 찾기
- 블록, 문서 구조, 전체 Markdown 형태로 내용 읽기
- 섹션 추가, 블록 수정, 문서 생성/이동으로 내용 바꾸기
- 노트북, 문서, 블록 전반의 구조 정리하기

개인 지식 베이스 통합으로서의 핵심 가치는 에이전트가 일반적인 답변만 하는 것이 아니라 사용자의 실제 맥락 안에서 작업할 수 있다는 점입니다. 작성해 둔 노트를 이어서 활용하고, 요약하고, 여러 문서에 걸친 의사결정을 추적하고, 정리해 줄 수 있습니다.

다음 두 영역은 좀 더 고급 기능입니다.

- `siyuan_sql_query`는 필요할 때 에이전트가 더 효율적으로 검색할 수 있도록 제공됩니다. 대부분의 사용자는 SQL을 직접 작성할 필요가 없습니다.
- 블록 속성 도구는 이미 `custom-*` 메타데이터를 사용하는 워크플로가 있을 때 유용합니다. 그런 패턴을 사용하지 않는다면 무시해도 됩니다.

정확한 도구 설명은 `src/tools/*.ts`를 참고하세요.

## 주의 사항과 제한

이 서버는 권한이 높은 로컬 통합입니다. 설정이 끝나면 클라이언트는 사용자의 API 토큰으로 SiYuan과 직접 통신합니다.

- 기본 대상은 `http://127.0.0.1:6806`입니다
- `SIYUAN_BASE_URL`을 비로컬 주소로 지정하면 토큰과 노트 내용이 그 주소로 전송됩니다
- 해당 비로컬 대상이 HTTPS가 아니면 전송 중에 토큰과 내용이 노출될 수 있습니다
- 삭제, 이동, 수정 도구는 지식 베이스에 실제 쓰기 작업을 수행합니다
- `siyuan_sql_query`는 단일 읽기 전용 `SELECT`만 허용하며 `UPDATE`, `DELETE`, `PRAGMA`, 다중 구문 payload는 거부합니다

이 버전부터 `SIYUAN_BASE_URL`이 비로컬이거나 HTTPS가 아닐 때 서버가 시작 시 경고를 출력합니다.

이 프로젝트는 현재 로컬 `stdio` MCP 서버 형태로 제공됩니다.

- 적합한 경우: 로컬 MCP 프로세스를 실행할 수 있는 클라이언트
- 적합하지 않은 경우: 호스팅형, 멀티테넌트, 원격 관리 MCP 게이트웨이

## 문제 해결

### `SIYUAN_TOKEN`이 없음

서버가 시작 시 종료됩니다. 클라이언트 설정에서 MCP 서버 환경 변수에 토큰을 추가하세요.

### SiYuan에 연결할 수 없음

다음을 확인하세요.

- SiYuan이 실행 중인지
- `SIYUAN_BASE_URL`이 올바른지
- 설정된 대상이 로컬인지 원격인지

비로컬 경고가 보이면 현재 설정은 토큰을 호스트 밖으로 전송하게 됩니다.

### 401 Unauthorized

대개 토큰이 잘못되었거나, 만료되었거나, 다른 SiYuan 인스턴스용입니다. 토큰 출처와 `SIYUAN_BASE_URL`이 같은 인스턴스를 가리키는지 확인하세요.

### SQL 결과가 잘림

큰 조회 결과는 의도적으로 잘립니다. `LIMIT`, `WHERE`를 추가하거나 더 적은 컬럼만 선택하세요.

## 알려진 제한 사항

- 로컬에서 실행되는 `stdio` 서버만 지원하며, 호스팅된 원격 MCP 서비스는 지원하지 않습니다
- SiYuan API 토큰 외에 추가 권한 계층은 없습니다
- SQL 도구는 읽기 전용 `SELECT`만 지원합니다
- 큰 결과 집합은 클라이언트에 도달하기 전에 잘립니다

## 감사의 말

이 프로젝트는 SiYuan 공식 API 문서를 참고해 구현되었습니다.

- SiYuan 저장소: [github.com/siyuan-note/siyuan](https://github.com/siyuan-note/siyuan)
- SiYuan API 문서: [API.md](https://github.com/siyuan-note/siyuan/blob/master/API.md)
