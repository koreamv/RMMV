男爵さんオーダーメイドのプラグインです。
オーダー内容は「スキル使用前にコモンイベント」です。

使い方は、 js/plugins フォルダへ入れてプラグインマネージャーで登録する。
そのあと、適当なコモンイベントを登録して、スキルのメモに「<before:CommmonEvent:1>」とか書く。

詳しい処理は CallCommonEventBeforeSkill.js を見て下さい。

以下のネイティブプラグインを一部、オーバーライドしています。
- rpg_objects.js
- rpg_scenes.js

version 0.0.1
- とりあえず動くようにしたよ！

