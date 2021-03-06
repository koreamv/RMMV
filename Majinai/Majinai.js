//=============================================================================
// Majinai.js
//=============================================================================

/*:
 * @plugindesc Description
 *
 * @author saronpasu
 *
 * @version 0.0.1
 *
 * @help
 *
 * @param PluginParam
 * @desc Description
 * @default
 *
 * Plugin Command:
 *   Command argment      # description
 *
 * Help message write here.
 *
 */

/*:ja
 * @plugindesc 説明とか。
 *
 * @author saronpasu
 *
 * @help
 *
 * @param PluginParam
 * @desc 説明とか
 * @default
 *
 * Plugin Command:
 *   Command argments      # 説明とか
 *
 * ヘルプメッセージを書くとこ。
 *
 */

/*
 * Copyright (c) 2016 saronpasu
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 *
 */

var Imported = Imported || {};
Imported.Majinai = {};

(function() {

    'use strict';

    // 免疫
    var AntiCurse;

    // 呪い
    var Curse;

    // 症状
    var Progress;

    // トリガー
    var Trigger;

    // 単語
    var Terms;

    // 呪いと症状の管理機能
    var CurseProgressManager;

    var parameters = PluginManager.parameters('Majinai');
    var Language = String(parameters['Language'] || 'ja');

    var _Game_Interpreter_pluginCommand =
            Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'Majinai') {
        }
    };

    /*
        Curce Data Block
            Note: Infection(感染), Incubation(潜伏), Progress(症状の進行), Expire(発症)
            訳語が適当かもだけど気にするな！
    */

    AntiCurse = function() {
        this.initialize.apply(this, arguments);
    };

    AntiCurse.prototype.initialize = function(antiCurseId) {
        this.setup(antiCurseId);
    };

    AntiCurse.prototype.setup = function(antiCurseId) {
        this.id = antiCurseId;
        this.data = $dataAntiCurses[this.id];

        this.name = this.data.name;
        this.description = this.data.description;
        this.curseId = this.data.curseId;
        this.rate = this.data.rate;
        this.visibility = this.data.visibility;
    };

    AntiCurse.prototype.isVisible = function() {
        return this.visibility;
    };

    AntiCurse.prototype.getName = function() {
        if(this.isNameVisible) {
            return this.name;
        }else {
            return Terms[Language]['words']['Unkonw'];
        }
    };

    AntiCurse.prototype.getDescription = function() {
        if(this.isNameVisible) {
            return this.description;
        }else {
            return Terms[Language]['words']['Unkonw'];
        }
    };

    AntiCurse.prototype.antiCurseRate = function() {
        if(this.isNameVisible) {
            return this.rate;
        }else {
            return false;
        }
    };

    AntiCurse.prototype.curseId = function() {
        return this.curseId;
    };

    Curse = function() {
        this.initialize.apply(this, arguments);
    };

    Curse.prototype.initialize = function(curseId) {
        this.setup(curseId);
    };

    Curse.prototype.setup = function(curseId) {
        this.id = curseId;
        this.data = $dataCurses[this.id];

        this.name = this.data.name;
        this.description = this.data.description;
        this.visibility = this.data.visibility;
        this.infectionTriggers = this.data.infectionTriggers.map(function(elem) {
            var trigger = new Trigger(elem);
            return trigger;
        });
        this.incubation = this.data.incubation;
        this.incubationLevel = this.data.incubationLevel;
        this.natureAntiCurseRate = Number(this.data.natureAntiCurseRate);
        this.progressId = this.data.progressId;
        this.progress = function() {
            return new Progress(this.progressId);
        }
    };

    Curse.prototype.triggers = function() {
        return this.infectionTriggers;
    };

    Curse.prototype.progress = function() {
        return this.progress;
    };

    Curse.prototype.isNameVisible = function() {
        return !this.visibility.nameHidden;
    };

    Curse.prototype.isInfectionVisible = function() {
        return !this.visibility.infectionHidden;
    };

    Curse.prototype.isProgressVisible = function() {
        return !this.visibility.beforeExpireHidden;
    };

    Curse.prototype.hasHpDamageTrigger = function() {
        var triggers = this.triggers().filter(function(elem) {
            return elem.isHpDamage();
        });
        return (triggers.length != 0);
    };

    Curse.prototype.hasMpDamageTrigger = function() {
        var triggers = this.triggers().filter(function(elem) {
            return elem.isMpDamage();
        });
        return (triggers.length != 0);
    };

    Curse.prototype.hasTpDamageTrigger = function() {
        var triggers = this.triggers().filter(function(elem) {
            return elem.isTpDamage();
        });
        return (triggers.length != 0);
    };

    Curse.prototype.getName = function() {
        if(this.isNameVisible) {
            return this.name;
        }else {
            return Terms[Language]['words']['Unkonw'];
        }
    };

    Curse.prototype.getDescription = function() {
        if(this.isNameVisible) {
            return this.description;
        }else {
            return Terms[Language]['words']['Unkonw'];
        }
    };

    Curse.prototype.getProgress = function() {
        if(this.isProgressVisible) {
            return this.progress;
        }else {
            return false;
        }
    };

    Progress = function() {
        this.initialize.apply(this, arguments);
    };

    Progress.prototype.initialize = function(progressId) {
        this.setup(progressId);
    };

    Progress.prototype.setup = function(progressId) {
        this.id = progressId;
        this.data = $dataProgress[this.id];
        this.name = this.data.name;
        this.description = this.data.description;
        this.count = 0;
        this.limit = Number(this.data.limit);
        this.level = 0;
        this.maxLevel = Number(this.data.maxLevel);
        this.progressTriggers = this.data.progressTriggers.map(function(elem) {
            var trigger = new Trigger(elem);
            return trigger;
        });
        this.curseId = this.data.curseId;
        this.curse = new Curse(this.data.curseId);
        this.effects = this.data.effects.map(function(elem) {
            if (elem.effect) {
                return {
                    'effect':   $dataStates[elem.effect],
                    'expireLevel':  elem.expireLevel
                };
            } else {
                elem
            }
        });
    };

    Progress.prototype.isVisible = function() {
        return (this.curse.isProgressVisible || this.isExpire)
    };

    Progress.prototype.getName = function() {
        if(this.isVisible) {
            return this.name;
        }else {
            return false;
        }
    };

    Progress.prototype.getDescription = function() {
        if(this.isVisible) {
            return this.description;
        }else {
            return false;
        }
    };

    Progress.prototype.isExpire = function() {
        return (this.curse.incubationLevel <= this.level);
    };

    Progress.prototype.getCount = function() {
        return this.count;
    };

    Progress.prototype.getLimit = function() {
        return this.limit;
    };

    Progress.prototype.getLevel = function() {
        return this.level
    };

    Progress.prototype.getLevelText = function() {
        switch (this.level) {
            case 0:
                return Terms[Language]['words']['progressLevel0'];
                break;
            case 1:
                return Terms[Language]['words']['progressLevel1'];
                break;
            case 2:
                return Terms[Language]['words']['progressLevel2'];
                break;
            case 3:
                return Terms[Language]['words']['progressLevel3'];
                break;
            case 4:
                return Terms[Language]['words']['progressLevel4'];
                break;
            default:

        }
    };

    Progress.prototype.getMaxLevel = function() {
        return this.maxLevel;
    };

    Progress.prototype.isLevelUp = function() {
        return (this.count >= this.limit);
    };

    Progress.prototype.resetCount = function() {
        this.count = 0;
    };

    Progress.prototype.levelUp = function() {
        if(this.level == this.maxLevel) {
            this.resetCount();
            return false;
        }else {
            this.resetCount();
            this.level += 1;
        }
    };

    Progress.prototype.getAllEffects = function() {
        return this.effects;
    };

    Progress.prototype.getActiveEffects = function() {
        var activeEffects;
        activeEffects = this.effects.filter(function(elem) {
            return (elem.expireLevel >= this.level)
        }, this);
        return activeEffects;
    };

    Progress.prototype.triggers = function() {
        return this.progressTriggers;
    };

    Progress.prototype.getTrigger = function() {
        return this.trigger();
    };

    Progress.prototype.hasHpDamageTrigger = function() {
        var triggers = this.triggers().filter(function(elem) {
            return elem.isHpDamage();
        });
        return (triggers.length != 0);
    };

    Progress.prototype.hasMpDamageTrigger = function() {
        var triggers = this.triggers().filter(function(elem) {
            return elem.isMpDamage();
        });
        return (triggers.length != 0);
    };

    Progress.prototype.hasTpDamageTrigger = function() {
        var triggers = this.triggers().filter(function(elem) {
            return elem.isTpDamage();
        });
        return (triggers.length != 0);
    };

    Progress.prototype.hasHpCostTrigger = function() {
        var triggers = this.triggers().filter(function(elem) {
            return elem.isHpCost();
        });
        return (triggers.length != 0);
    };

    Progress.prototype.hasMpCostTrigger = function() {
        var triggers = this.triggers().filter(function(elem) {
            return elem.isMpCost();
        });
        return (triggers.length != 0);
    };

    Progress.prototype.hasTpCostTrigger = function() {
        var triggers = this.triggers().filter(function(elem) {
            return elem.isTpCost();
        });
        return (triggers.length != 0);
    };

    Trigger = function() {
        this.initialize.apply(this, arguments);
    }

    Trigger.prototype.initialize = function(triggerId) {
        this.setup(triggerId);
    };

    Trigger.prototype.setup = function(triggerId) {
        this.id = triggerId;
        this.data = $dataTriggers[this.id];

        this.type = this.data.type;
        this.rate = Number(this.data.rate);
    };

    Trigger.prototype.isHpDamage = function() {
        return (this.type == 'HP_damage');
    };

    Trigger.prototype.isMpDamage = function() {
        return (this.type == 'MP_damage');
    };

    Trigger.prototype.isTpDamage = function() {
        return (this.type == 'TP_damage');
    };

    Trigger.prototype.isHpCost = function() {
        return (this.type == 'HP_cost');
    };

    Trigger.prototype.isMpCost = function() {
        return (this.type == 'MP_cost');
    };

    Trigger.prototype.isTpCost = function() {
        return (this.type == 'TP_cost');
    };

    Terms = {
        'ja': {
            'words': {
                'AntiCurse' :   '免疫',
                'Curse' :   '呪い',
                'Unknown'   :   '不明',
                'Infection' :   '感染',
                'InfectionTrigger'  :   '感染トリガー',
                'Incubation'    :   '潜伏期間',
                'Progress'  :   '進行',
                'ProgressTrigger'   :   '症状進行トリガー',
                'ProgressLevel' :   '症状進行レベル',
                'ProgressLevel0'    :   '未発症',
                'ProgressLevel1'    :   '軽度',
                'ProgressLevel2'    :   '中度',
                'ProgressLevel3'    :   '重度',
                'ProgressLevel4'    :   '末期',
                'Effects'   :   '効果',
                'Expire'    :   '発症'
            },
            'messages': {
                'infection' :   '%1は%2に%3した。',
                'progressLevelUp'   :   '%1の%2[%3]は%2[%4]に%5した。',
                'curseExpire'   :   '%1は%2を%3した。',
                'cureCurse' :   '%1の%2は回復した。',
                'makeAntiCurse' :   '%1は%2への%3を得た。',
                'infomation'    :   '%1は%2[%3]に%4している。',
            }
        },
        'en': {
            'words': {
                'AntiCurse' :   '',
                'Curse' :   '',
                'Unknown'   :   '',
                'Infection' :   '',
                'InfectionTrigger'  :   '',
                'Incubation'    :   '',
                'Progress'  :   '',
                'ProgressTrigger'   :   '',
                'ProgressLevel' :   '',
                'Effects'   :   '',
                'Expire'    :   ''
            },
            'messages': {

            }
        }
    };

    /*
        RPGMV customize Block
    */

    var _Game_BattlerBase_initMembers = Game_BattlerBase.prototype.initMembers
    Game_BattlerBase.prototype.initMembers = function() {
        _Game_BattlerBase_initMembers.call(this);

        this.crearCurse();
        this.crearAntiCurse();
    };

    Game_BattlerBase.prototype.crearCurse = function() {
        // 呪いの初期化
        this._curses = [];
        this._progresses = [];
    };

    Game_BattlerBase.prototype.crearAntiCurse = function() {
        // 免疫の初期化
        this._antiCurses = [];
    };

    Game_BattlerBase.prototype.curses = function() {
        // すべての呪いを取得する
        return this._curses.filter(function(elem) {
            return elem instanceof Curse;
        });
    };

    Game_BattlerBase.prototype.antiCurses = function() {
        // すべての免疫を取得する
        return this._antiCurses.filter(function(elem) {
            return elem instanceof AntiCurse;
        });
    };

    Game_BattlerBase.prototype.progresses = function() {
        // すべての症状を取得する
        return this._progresses.filter(function(elem) {
            return elem instanceof Progress;
        });
    };

    Game_BattlerBase.prototype.hasCurses = function() {
        // 感染しているかどうか
        return this._curses.length != 0;
    };

    Game_BattlerBase.prototype.addNewProgress = function(progressId) {
        var progress = new Progress(progressId);
        this._progresses.push(progress);
    };

    Game_BattlerBase.prototype.addNewCurse = function(curseId) {
        // 呪いと症状を付与する
        if (this.hasCurse(curseId)) {
            return false;
        }
        this._curses.push(curseId);
        var curse = new Curse(curseId);
        this._curses.push(curse);
        this.addNewProgress(curse.progressId);
    };

    Game_BattlerBase.prototype.addCurse = function(curseId) {
        // 症状を付与する(強制)
        this.addNewCurse(curseId);
        this._result.pushAddedCurse(curseId);
        this.addActiveEffects();
    };

    Game_BattlerBase.prototype.receiveInfection = function(curseId, triggerId) {
        // 感染を受ける判定 感染率(能動) -> 免疫(受動) -> 成否 の流れ
        // 既に感染しているか
        if(this.hasCurse(curseId)) {
            return false;
        }
        // 感染成功テスト
        var curse = $dataCurses[curseId];
        var trigger = $dataTriggers[triggerId];
        var curseRate = trigger.rate;
        if(trigger.rate <= 0) {
            return false;
        }else if (trigger.rate > 100) {
            curseRate = 100;
        }

        var infectionResult = (Math.randomInt(100) <= curseRate);
        if(!infectionResult) {
            return false;
        }
        // 免疫を得ているか
        if(this.hasAntiCurse(curseId)) {
            var antiCurse = this.findAntiCurse(curseId);
            if (antiCurse) {
                if (antiCurse === true) {
                    return false;
                }
                // 免疫による防護成功テスト
                var antiCurseRate = antiCurse.rate;
                if(antiCurseRate <= 0) {
                    antiCurseRate = 0;
                }else if (antiCurseRate > 100) {
                    antiCurseRate = 100;
                }
                infectionResult = !(Math.randomInt(100) <= antiCurseRate);
            }
        }

        if (!infectionResult) {
            return false;
        }else {
            // 感染成功時の処理
            this.addCurse(curseId);
        }
    };

    Game_BattlerBase.prototype.removeCurse = function(curseId) {
        // 症状を除去する(強制)
        var index;
        var i;
        var curses = this._curses;
        for(i=0;i<curses.length;i++) {
            if(curses[i].id && curses[i].id == curseId) {
                index = i;
            }
        }
        if (index >= 0) {
            var result = this._curses.splice(index, 1);
        }
        var progressId = this.progresses().filter(function(elem){return elem.curseId == curseId})[0].id;
        this.removeActiveEffects(progressId);
        this._result.pushRemovedCurse(curseId);
    };

    Game_BattlerBase.prototype.removeAllCurse = function() {
        // 症状をすべて除去する(強制)
        var progresses = this.progresses();
        if(progresses.length != 0) {
            var i;
            for(i=0;i<progresses.length;i++) {
                this.removeActiveEffects(progresses[i].id);
            }
        }
        this._curses = [];
    };

    Game_BattlerBase.prototype.cureCurse = function(action, curseId) {
        // 症状を治療する判定 治療成功率(能動) -> 成否 の流れ
        // 感染しているか
        if(!this.hasCurse(curseId)) {
            return false;
        }
        // 対応した治療方法か
        var source = action.item().note;
        var targetCursePattern = new RegExp('cureCurseId:(\\d+)', 'g');
        var cureCurseRatePattern = new RegExp('cureCurseRate:(\\d+)', 'g');
        var targetCurseId;
        if (targetCursePattern.test(source)) {
            targetCursePattern = new RegExp('cureCurseId:(\\d+)', 'g');
            targetCurseId = Number(targetCursePattern.exec(source)[1]);
        }else{
            return false;
        }
        var cureCurseRate;
        if (cureCurseRatePattern.test(source)) {
            cureCurseRatePattern = new RegExp('cureCurseRate:(\\d+)', 'g');
            cureCurseRate = Number(cureCurseRatePattern.exec(source)[1]);
        }else{
            return false;
        }
        if(curseId != targetCurseId) {
            return false;
        }
        if(cureCurseRate < 0) {
            cureCurseRate = 0;
        }else if (cureCurseRate > 100) {
            cureCurseRate = 100;
        }
        // 治療判定
        var cureResult = (Math.randomInt(100) <= cureCurseRate);
        if(!cureResult) {
            return false;
        }
        // 回復処理
        this.removeCurse(curseId);
        this.makeAntiCurse(curseId);
    };

    Game_BattlerBase.prototype.addNewAntiCurse = function(antiCurseId) {
        var antiCurse = new AntiCurse(antiCurseId);
        this._antiCurses.push(antiCurse);
    };

    Game_BattlerBase.prototype.addAntiCurse = function(antiCurseId) {
        // 免疫を得る(強制)
        this.addNewAntiCurse(antiCurseId);
        this._result.pushMakedAntiCurse(antiCurseId);

    };

    Game_BattlerBase.prototype.makeAntiCurse = function(curseId) {
        // 免疫を得る判定 免疫獲得率 -> 成否 の流れ
        // 既に免疫を得ているか
        var natureAntiCurses = this.antiCurses();
        if(natureAntiCurses.filter(function(elem){return elem.curseId == curseId}).length != 0) {
            return false;
        }
        var curse = new Curse(curseId);
        var natureAntiCurseRate = curse.natureAntiCurseRate;
        var i;
        if(natureAntiCurseRate <= 0) {
            return false;
        }else if (natureAntiCurseRate > 100) {
            natureAntiCurseRate = 100;
        }
        var makeAntiCurseResult = (Math.randomInt(100) <= curse.natureAntiCurseRate);
        var antiCurse;
        if(makeAntiCurseResult) {
            for(i=0;i<$dataAntiCurses.length;i++) {
                if($dataAntiCurses[i] && $dataAntiCurses[i].curseId == curseId) {
                    antiCurse = $dataAntiCurses[i];
                }
            }
        }
        if(antiCurse) {
            if(this.hasAntiCurse(antiCurse.id)) {
                return false;
            }
            this.addAntiCurse(antiCurse.id);
        }
    };

    Game_BattlerBase.prototype.progressLevelUp = function(curseId) {
        // 症状を進行させる(強制), expire フラグを result に付与する
        if(!this.hasCurse(curseId)) {
            return false;
        }
        var i;
        var progresses = this.progresses();
        var progress;
        for(i=0;i<progresses.length;i++) {
            if(progresses[i].curseId = curseId) {
                progress = progresses[i];
            }
        }

        var beforeExpire = progress.isExpire();
        progress.levelUp();
        var afterExpire = progress.isExpire();
        if (!beforeExpire && afterExpire) {
            this._result.pushExpireCurse(curseId);
        }else {
            this._result.pushProgressLevelUp(curseId);
        }
        this.addActiveEffects(progress.id);
    };

    Game_BattlerBase.prototype.progressGrowUp = function(triggerId, curseId) {
        // 症状を進行させる
        // 感染しているかどうか
        if(!this.hasCurse(curseId)) {
            return false;
        }
        // 対応するトリガーかどうか
        var curse = new Curse(curseId);
        var progressId = curse.progressId;
        var triggers = curse.triggers();
        var trigger;
        var i;
        for(i=0;i<triggers.length;i++) {
            if (triggers[i].id = triggerId) {
                trigger = triggers[i];
            }
        }
        if (!trigger) {
            return false;
        }
        // 免疫を得ているか
        var progressResult;
        if(this.hasAntiCurse(curseId)) {
            var antiCurse = this.findAntiCurse(curseId);
            if (antiCurse) {
                // 免疫による防護成功テスト
                if (antiCurse === true) {
                    return false;
                }
                var antiCurseRate = antiCurse.rate;
                if(antiCurseRate <= 0) {
                    antiCurseRate = 0;
                }else if (antiCurseRate > 100) {
                    antiCurseRate = 100;
                }
                progressResult = (Math.randomInt(100) <= antiCurseRate);
            }
        }
        if(progressResult) {
            return false;
        }
        // トリガーの値を取得
        var rate = Number(trigger.rate);
        // 症状のカウンタにトリガーの値を加算
        var progresses = this.progresses();
        var progress;
        for(i=0;i<progresses.length;i++) {
            if(progresses[i].id == progressId) {
                progress = progresses[i];
            }
        }
        progress.count += rate;
        // 症状のレベルアップ処理
        if(progress.count >= progress.limit) {
            this.progressLevelUp(curseId);
        }
    };

    Game_BattlerBase.prototype.addActiveEffects = function(progressId) {
        // 症状を発火させる。アクティブなステートを自動で付与
        // 症状の進行時、感染時にも起動する
        if (this.progresses().length == 0) {
            return false;
        }
        var progress;
        progress = this.progresses().filter(function(elem){return elem.id == progressId})[0];
        if (!progress) {
            return false;
        }
        var activeEffects = progress.getActiveEffects();
        var i;
        activeEffects = activeEffects.filter(function(elem){return !!elem.effect});
        for(i=0;i<activeEffects.length;i++) {
            this.addState(activeEffects[i].effect.id);
        }
    }

    Game_BattlerBase.prototype.removeActiveEffects = function(progressId) {
        // 症状を鎮火させる。アクティブなステートを全て除去
        // 症状を除去する(強制)時に連動する
        if (this.progresses().length == 0) {
            return false;
        }
        var progress;
        progress = this.progresses().filter(function(elem){return elem.id == progressId})[0];
        if (!progress) {
            return false;
        }
        var activeEffects = progress.getActiveEffects();
        var i;
        activeEffects = activeEffects.filter(function(elem){return !!elem.effect});
        for(i=0;i<activeEffects.length;i++) {
            this.removeState(activeEffects[i].effect.id, true);
        }
    }

    Game_BattlerBase.prototype.allActiveEffects = function() {
        // TODO: recoverActiveEffects 専用
        var progresses = this.progresses();
        var activeEffects = progresses.map(function(elem){return elem.getActiveEffects()});
        activeEffects = Array.prototype.concat.apply([], activeEffects);
        if (activeEffects.length == 0) {
            return false;
        }
        activeEffects = activeEffects.map(function(elem){return elem.effect});
        activeEffects = activeEffects.filter(function(x,i,self){return self.indexOf(x) === i});
        activeEffects = activeEffects.filter(function(elem){return !!elem});
        activeEffects = activeEffects.map(function(elem){return elem.id});
        return activeEffects;
    }

    var _Game_Battler_removeState = Game_Battler.prototype.removeState;
    Game_Battler.prototype.removeState = function(stateId, force) {
        if(!this.isActiveEffects(stateId) || force) {
            _Game_Battler_removeState.bind(this, stateId).call();
        }else{
            console.log('block!');
        }
    }

    Game_BattlerBase.prototype.isActiveEffects = function(stateId) {
        var activeEffects = this.allActiveEffects();
        if(activeEffects) {
            return (activeEffects.indexOf(stateId) != -1);
        }
        return false;
    }

    Game_BattlerBase.prototype.recoverActiveEffects = function(stateId) {
        if(this.isActiveEffects(stateId)) {
            this.addState(stateId);
        }
    }

    Game_BattlerBase.prototype.hasInfection = function() {
        // 感染させるかどうか
        if(!this.hasCurses()) {
            return false;
        }
        return (this.curses().filter(function(curse) {
            return (curse.triggers().length != 0);
        }).length != 0);
    };

    Game_BattlerBase.prototype.hasCurse = function(curseId) {
        // 既に感染しているかどうか
        if(!this.hasCurses()) {
            return false;
        }
        return (this.curses().filter(function(curse) {return curse.id == curseId}).length != 0);
    };

    Game_BattlerBase.prototype.hasAntiCurse = function(curseId) {
        // 免疫を持っているかどうか
        if(this.antiCurses().length == 0) {
            return false;
        }
        var antiCurses = this.antiCurses();
        var i;
        var result;
        for(i=0;i<antiCurses.lentgh;i++) {
            if(antiCurses[i].targetId == 'All') {
                result = true;
            }
        }
        if(result) {
            return true;
        }
        return (this.antiCurses().filter(function(antiCurse) {
            return (antiCurse.curseId == curseId);
        }).length != 0)
    };

    Game_BattlerBase.prototype.hasHpDamageInfectionTrigger = function() {
        var triggers = Array.prototype.concat.apply([], this.curses().map(function(elem) {return elem.triggers()}));
        triggers.filter(function(elem) {
            return elem.isHpDamage();
        });
        return (triggers.lentgh != 0);
    };

    Game_BattlerBase.prototype.hasMpDamageInfectionTrigger = function() {
        var triggers = Array.prototype.concat.apply([], this.curses().map(function(elem) {return elem.triggers()}));
        triggers.filter(function(elem) {
            return elem.isMpDamage();
        });
        return (triggers.lentgh != 0);
    };

    Game_BattlerBase.prototype.hasTpDamageInfectionTrigger = function() {
        var triggers = Array.prototype.concat.apply([], this.curses().map(function(elem) {return elem.triggers()}));
        triggers.filter(function(elem) {
            return elem.isTpDamage();
        });
        return (triggers.lentgh != 0);
    };

    Game_BattlerBase.prototype.hasHpDamageProgressTrigger = function() {
        var triggers = Array.prototype.concat.apply([], this.progresses().map(function(elem) {return elem.triggers()}));
        triggers.filter(function(elem) {
            return elem.isHpDamage();
        });
        return (triggers.lentgh != 0);
    };

    Game_BattlerBase.prototype.hasMpDamageProgressTrigger = function() {
        var triggers = Array.prototype.concat.apply([], this.progresses().map(function(elem) {return elem.triggers()}));
        triggers.filter(function(elem) {
            return elem.isMpDamage();
        });
        return (triggers.lentgh != 0);
    };

    Game_BattlerBase.prototype.hasTpDamageProgressTrigger = function() {
        var triggers = Array.prototype.concat.apply([], this.progresses().map(function(elem) {return elem.triggers()}));
        triggers.filter(function(elem) {
            return elem.isTpDamage();
        });
        return (triggers.lentgh != 0);
    };

    Game_BattlerBase.prototype.hasHpCostProgressTrigger = function() {
        var triggers = Array.prototype.concat.apply([], this.progresses().map(function(elem) {return elem.triggers()}));
        triggers.filter(function(elem) {
            return elem.isHpCost();
        });
        return (triggers.lentgh != 0);
    };

    Game_BattlerBase.prototype.hasMpCostProgressTrigger = function() {
        var triggers = Array.prototype.concat.apply([], this.progresses().map(function(elem) {return elem.triggers()}));
        triggers.filter(function(elem) {
            return elem.isMpCost();
        });
        return (triggers.lentgh != 0);
    };

    Game_BattlerBase.prototype.hasTpCostProgressTrigger = function() {
        var triggers = Array.prototype.concat.apply([], this.progresses().map(function(elem) {return elem.triggers()}));
        triggers.filter(function(elem) {
            return elem.isTpCost();
        });
        return (triggers.lentgh != 0);
    };

    Game_BattlerBase.prototype.findAntiCurse = function(curseId) {
        var i;
        var antiCurses = this.antiCurses();
        var allAntiCurse;
        if (allAntiCurse) {
        for(i=0;i<antiCurses.length;i++) {
            if(allAntiCurses[i].targetId = 'All') {
                allAntiCurses = true;
            }
        }
            return allAntiCurse;
        }
        var hitAntiCurse;
        for(i=0;i<antiCurses.length;i++) {
            if(antiCurses[i].curseId == curseId) {
                hitAntiCurse = antiCurses[i];
            }
        }
        if (hitAntiCurse) {
            return hitAntiCurse;
        }
        return false;
    };

    Game_BattlerBase.prototype.hasHpDamageTrigger = function() {
        // HPダメージトリガーがあるか
        if(this.hasInfection() != true) {
            return false;
        }
        return (this.curses().filter(
            function(curse) {
                return curse.triggers().filter(function(trigger) {
                    return (trigger.isHpDamage());
                });
            }
        ).length != 0);
    };

    Game_BattlerBase.prototype.hasTpDamageTrigger = function() {
        // TPダメージトリガーがあるか
        if(this.hasInfection() != true) {
            return false;
        }
        return (this.curses().filter(
            function(curse) {
                return curse.triggers().filter(function(trigger) {
                    return (trigger.isTpDamage());
                });
            }
        ).length != 0);
    };

    Game_BattlerBase.prototype.hasMpDamageTrigger = function() {
        // MPダメージトリガーがあるか
        if(this.hasInfection() != true) {
            return false;
        }
        return (this.curses().filter(
            function(curse) {
                return curse.triggers().filter(function(trigger) {
                    return (trigger.isMpDamage());
                });
            }
        ).length != 0);
    };

    Game_BattlerBase.prototype.hasHpCostTrigger = function() {
        // HPコストトリガーがあるか
        if(this.hasInfection() != true) {
            return false;
        }
        return (this.curses().filter(
            function(curse) {
                return curse.triggers().filter(function(trigger) {
                    return (trigger.isHpCost());
                });
            }
        ).length != 0);
    };

    Game_BattlerBase.prototype.hasMpCostTrigger = function() {
        // MPコストトリガーがあるか
        if(this.hasInfection() != true) {
            return false;
        }
        return (this.curses().filter(
            function(curse) {
                return curse.triggers().filter(function(trigger) {
                    return (trigger.isMpCost());
                });
            }
        ).length != 0);
    };

    Game_BattlerBase.prototype.hasTpCostTrigger = function() {
        // TPコストトリガーがあるか
        if(this.hasInfection() != true) {
            return false;
        }
        return (this.curses().filter(
            function(curse) {
                return curse.triggers().filter(function(trigger) {
                    return (trigger.isTpCost());
                });
            }
        ).length != 0);
    };

    var _Game_Enemy_setup = Game_Enemy.prototype.setup;
    Game_Enemy.prototype.setup = function(enemyId, x, y) {
        _Game_Enemy_setup.bind(this, enemyId, x, y).call();

        // メモ解析
        var source = this.enemy().note;
        // antiCurse
        var antiCurseId;
        var antiCursePattern = new RegExp('antiCurseId:(\\d+)', 'g');
        if (antiCursePattern.test(source)) {
            antiCursePattern = new RegExp('antiCurseId:(\\d+)', 'g');
            antiCurseId = Number(antiCUrsePattern.exec(source)[1]);
            this.addNewAntiCurse(antiCurseId);
        }
        // curse
        var curseId;
        var cursePattern = new RegExp('curseId:(\\d+)', 'g');
        if (cursePattern.test(source)) {
            cursePattern = new RegExp('curseId:(\\d+)', 'g');
            curseId = Number(cursePattern.exec(source)[1]);
            this.addNewCurse(curseId);
        }
        // progressLevel
        var progressLevel;
        var progress;
        var progressLevelPattern = new RegExp('progressLevel:(\d+)', 'g');
        if (progressLevelPattern.test(source)) {
            progressLevelPattern = new RegExp('progressLevel:(\d+)', 'g');
            progressLevel = Number(progressLevelPattern.exec(source)[1]);
            var i;
            var progresses = this.progresses();
            for(i=0;i<progresses.length;i++) {
                if(progresses[i].curseId == curseId) {
                    progress = progresses[i];
                }
            }
            if (progress) {
                progress.level = progressLevel;
            }
        }
    };

    var Format = {};

    Format.data = {
        antiCurse:              String(Terms[Language]['words']['AntiCurse']),
        curse:                  String(Terms[Language]['words']['Curse']),
        unkonw:                 String(Terms[Language]['words']['Unknown']),
        infection:              String(Terms[Language]['words']['Infection']),
        infectionTrigger:       String(Terms[Language]['words']['InfectionTrigger']),
        progress:               String(Terms[Language]['words']['Progress']),
        progressTrigger:        String(Terms[Language]['words']['ProgressTrigger']),
        progressLevel:          String(Terms[Language]['words']['ProgressLevel']),
        progressLevel0:         String(Terms[Language]['words']['ProgressLevel0']),
        progressLevel1:         String(Terms[Language]['words']['ProgressLevel1']),
        progressLevel2:         String(Terms[Language]['words']['ProgressLevel2']),
        progressLevel3:         String(Terms[Language]['words']['ProgressLevel3']),
        progressLevel4:         String(Terms[Language]['words']['ProgressLevel4']),
        effects:                String(Terms[Language]['words']['Effects']),
        expire:                 String(Terms[Language]['words']['Expire']),

        // Messages
        infectionMsg:           String(Terms[Language]['messages']['infection']),
        progressLevelUpMsg:     String(Terms[Language]['messages']['progressLevelUp']),
        curseExpireMsg:         String(Terms[Language]['messages']['curseExpire']),
        cureCurseMsg:           String(Terms[Language]['messages']['cureCurse']),
        makeAntiCurseMsg:       String(Terms[Language]['messages']['makeAntiCurse']),
        infomationMsg:          String(Terms[Language]['messages']['infomation']),
    };

    Format.format = function () {
        var template = arguments[0];
        var arr = Array.apply(null, arguments);
        arr.shift();
        var args = arr;
        return template.replace(/%([0-9]+)/g, function(s, n) {
            return args[Number(n) - 1];
        });
    }

    Window_BattleLog.prototype.makeInfectionText = function(target) {
        var curseMsg;
        target.result().addedCurseObjects().forEach(function(curseObj) {
            var curse = new Curse(curseObj.id);
            if(!curse.isInfectionVisible()) {
                return false;
            }
            var curseName = curse.getName();
            var fmt = Format.data.infectionMsg;
            curseMsg = Format.format(fmt, target.name(), curseName, Format.data.infection);
        });
        return curseMsg;
    };

    Window_BattleLog.prototype.makeProgressLevelUpText = function(target) {
        var progressLevelUpMsg;
        target.result().progressLevelUpObjects().forEach(function(progObj) {
            var progress = target.progresses().filter(function(elem){return elem.id == progObj.id})[0];
            var curse = new Curse(progress.curseId);
            var progressVisible = progress.isVisible();
            var expire = progress.isExpire();
            if (!expire && !progressVisible) {
                return false;
            }
            if (progress.level == progress.maxLevel) {
                return false;
            }
            var curseName = curse.getName;
            var progressName = progress.getName();
            var progressLevel = progress.level;
            var progressLevelWord;
            var beforeProgressLevelWord
            switch (progressLevel) {
                case 0:
                    beforeProgressLevelWord = Format.data.progressLevel0;
                    progressLevelWord = Format.data.progressLevel1;
                    break;
                case 1:
                    beforeProgressLevelWord = Format.data.progressLevel1;
                    progressLevelWord = Format.data.progressLevel2;
                    break;
                case 2:
                    beforeProgressLevelWord = Format.data.progressLevel2;
                    progressLevelWord = Format.data.progressLevel3;
                    break;
                case 3:
                    beforeProgressLevelWord = Format.data.progressLevel3;
                    progressLevelWord = Format.data.progressLevel4;
                    break;
                case 4:
                    beforeProgressLevelWord = Format.data.progressLevel4;
                    progressLevelWord = Format.data.progressLevel5;
                    break;
                default:
                    beforeProgressLevelWord = Format.data.unkonw;
                    progressLevelWord = Format.data.unkown;

            }
            var fmt;
            fmt = Format.data.progressLevelUpMsg;
            progressLevelUpMsg = Format.format(
                fmt,

                target.name(),
                progressName,
                beforeProgressLevelWord,
                progressLevelWord,
                Format.data.progress);
        });
        return progressLevelUpMsg;
    };

    Window_BattleLog.prototype.makeCurseExpireText = function(target) {
        var curseExpireMsg;
        target.result().expireCurseObjects().forEach(function(curseObj) {
            var curse = new Curse(curseObj.id);
            var curseName = curse.getName();
            var fmt;
            fmt = Format.data.curseExpireMsg;
            curseExpireMsg = Format.format(
                fmt, target.name(), curseName, Format.data.expire);
        });
        return curseExpireMsg;
    };

    Window_BattleLog.prototype.makeCureCurseText = function(target) {
        var cureCurseMsg;
        target.result().removedCurseObjects().forEach(function(curseObj) {
            var curse = new Curse(curseObj.id);
            var curseName = curse.getName();
            var progress = target.progresses().filter(function(elem){return elem.curseId == curse.id})[0];
            var progressName = progress.getName();
            var fmt;
            fmt = Format.data.cureCurseMsg;
            cureCurseMsg = Format.format(
                fmt, target.name(), progressName);
        });
        return cureCurseMsg;
    };

    Window_BattleLog.prototype.makeMakeAntiCurseText = function(target) {
        var makeAntiCurseMsg;
        target.result().makedAntiCurseObjects().forEach(function(antiCurseObj) {
            var antiCurse = new AntiCurse(antiCurseObj.id);
            var curse = new Curse(antiCurse.curseId);
            if(!antiCurse.isVisible()) {
                return false;
            }
            var curseName = curse.getName();
            var fmt;
            fmt = Format.data.makeAntiCurseMsg;
            makeAntiCurseMsg = Format.format(
                fmt, target.name(), curseName, Format.data.antiCurse);
        });
        return makeAntiCurseMsg;
    };

    Window_BattleLog.prototype.displayChangedCurses = function(target) {
        this.displayAddedCurses(target);
        this.displayRemovedCurses(target);
        this.displayMakedAntiCurses(target);
        this.displayProgressLevelUp(target);
        this.displayCurseExpire(target);
    };

    Window_BattleLog.prototype.displayAddedCurses = function(target) {
        var msg = this.makeInfectionText(target);
        if (msg) {
            this.push('popBaseLine');
            this.push('pushBaseLine');
            this.push('addText', msg);
            this.push('waitForEffect');
        }
    };

    Window_BattleLog.prototype.displayRemovedCurses = function(target) {
        target.result().removedCurseObjects().forEach(function(curse) {
            var msg = this.makeCureCurseText(target);
            if (msg) {
                this.push('popBaseLine');
                this.push('pushBaseLine');
                this.push('addText', msg);
                this.push('waitForEffect');
            }else {
                return false;
            }
        }, this);
    };

    Window_BattleLog.prototype.displayMakedAntiCurses = function(target) {
        target.result().makedAntiCurseObjects().forEach(function(antiCurse) {
            var msg = this.makeMakeAntiCurseText(target);
            if (msg) {
                this.push('popBaseLine');
                this.push('pushBaseLine');
                this.push('addText', msg);
                this.push('waitForEffect');
            }else {
                return false;
            }
        }, this);
    };

    Window_BattleLog.prototype.displayProgressLevelUp = function(target) {
        target.result().progressLevelUpObjects().forEach(function(progress) {
            var msg = this.makeProgressLevelUpText(target);
            if (msg) {
                this.push('popBaseLine');
                this.push('pushBaseLine');
                this.push('addText', msg);
                this.push('waitForEffect');
            }else {
                return false;
            }
        }, this);
    };

    Window_BattleLog.prototype.displayCurseExpire = function(target) {
        var msg = this.makeCurseExpireText(target);
        if (msg) {
            this.push('popBaseLine');
            this.push('pushBaseLine');
            this.push('addText', msg);
            this.push('waitForEffect');
        }
    };

    Window_BattleLog.prototype.displayAffectedCurses = function(target) {
        this.push('pushBaseLine');
        this.displayChangedCurses(target);
        this.push('waitForNewLine');
        this.push('popBaseLine');
    };

    Window_BattleLog.prototype.displayAutoAffectedCurses = function(target) {
        this.displayAffectedCurses(target, null);
        this.push('clear');
    };

    var _Window_BattleLog_displayActionResults = Window_BattleLog.prototype.displayActionResults;
    Window_BattleLog.prototype.displayActionResults = function(subject, target) {
        if (target.result().used) {
            this.push('pushBaseLine');
            this.displayCritical(target);
            this.push('popupDamage', target);
            this.push('popupDamage', subject);
            this.displayDamage(target);
            this.displayAffectedCurses(target);
            this.displayAffectedStatus(target);
            this.displayFailure(target);
            this.push('waitForNewLine');
            this.push('popBaseLine');
        }
    };

    var _BattleManager_processTurn = BattleManager.processTurn;
    BattleManager.processTurn = function() {
        var subject = this._subject;
        var action = subject.currentAction();
        if (action) {
            action.prepare();
            if (action.isValid()) {
                this.startAction();
            }
            subject.removeCurrentAction();
        } else {
            subject.onAllActionsEnd();
            this.refreshStatus();
            this._logWindow.displayAutoAffectedCurses(subject);
            this._logWindow.displayAutoAffectedStatus(subject);
            this._logWindow.displayCurrentState(subject);
            this._logWindow.displayRegeneration(subject);
            this._subject = this.getNextSubject();
        }
    };

    var _BattleManager_endTurn = BattleManager.endTurn;
    BattleManager.endTurn = function() {
        this._phase = 'turnEnd';
        this._preemptive = false;
        this._surprise = false;
        this.allBattleMembers().forEach(function(battler) {
            battler.onTurnEnd();
            this.refreshStatus();
            this._logWindow.displayAutoAffectedCurses(battler);
            this._logWindow.displayAutoAffectedStatus(battler);
            this._logWindow.displayRegeneration(battler);
        }, this);
    };

    var _Game_ActionResult_clear = Game_ActionResult.prototype.clear;
    Game_ActionResult.prototype.clear = function() {
        _Game_ActionResult_clear.call(this);

        this.addedCurses = [];
        this.makedAntiCurses = [];
        this.removedCurses =  [];
        this.progressLevelUp = [];
        this.expireCurse = [];
    };

    Game_ActionResult.prototype.addedCurseObjects = function() {
        return this.addedCurses.map(function(id) {
            return $dataCurses[id];
        });
    };

    Game_ActionResult.prototype.makedAntiCurseObjects = function() {
        return this.makedAntiCurses.map(function(id) {
            return $dataAntiCurses[id];
        });
    };

    Game_ActionResult.prototype.removedCurseObjects = function() {
        return this.removedCurses.map(function(id) {
            return $dataCurses[id];
        });
    };

    Game_ActionResult.prototype.progressLevelUpObjects = function() {
        return this.progressLevelUp.map(function(id) {
            return $dataProgress[id];
        });
    };

    Game_ActionResult.prototype.expireCurseObjects = function() {
        return this.expireCurse.map(function(id) {
            return $dataProgress[id];
        });
    };

    Game_ActionResult.prototype.isCursesAffected = function() {
        return (this.addedCurses.length > 0 || this.removedCurses.length > 0 ||
                this.makedAntiCurses.length > 0 || this.expireCurse.length > 0 ||
                this.progressLevelUp.length > 0);
    };

    Game_ActionResult.prototype.isCurseAdded = function(curseId) {
        return this.addedCurses.contains(curseId);
    };

    Game_ActionResult.prototype.pushAddedCurse = function(curseId) {
        if (!this.isCurseAdded(curseId)) {
            this.addedCurses.push(curseId);
        }
    };

    Game_ActionResult.prototype.isAntiCurseMaked = function(curseId) {
        return this.makedAntiCurses.contains(curseId);
    };

    Game_ActionResult.prototype.pushMakedAntiCurse = function(antiCurseId) {
        if (!this.isAntiCurseMaked(antiCurseId)) {
            this.makedAntiCurses.push(antiCurseId);
        }
    };

    Game_ActionResult.prototype.isCurseRemoved = function(curseId) {
        return this.removedCurses.contains(curseId);
    };

    Game_ActionResult.prototype.pushRemovedCurse = function(curseId) {
        if (!this.isCurseRemoved(curseId)) {
            this.removedCurses.push(curseId);
        }
    };

    Game_ActionResult.prototype.isProgressLevelUp = function(curseId) {
        return this.progressLevelUp.contains(curseId);
    };

    Game_ActionResult.prototype.pushProgressLevelUp = function(curseId) {
        if (!this.isProgressLevelUp(curseId)) {
            this.progressLevelUp.push(curseId);
        }
    };

    Game_ActionResult.prototype.isExpireCurse = function(curseId) {
        return this.expireCurse.contains(curseId);
    };

    Game_ActionResult.prototype.pushExpireCurse = function(curseId) {
        if (!this.isExpireCurse(curseId)) {
            this.expireCurse.push(curseId);
        }
    };

    Game_Action.prototype.isInfection = function() {
        return this.subject().hasInfection();
    };

    Game_Action.prototype.isHpDamageInfectionTrigger = function() {
        return this.subject().hasHpDamageTrigger();
    };

    Game_Action.prototype.isMpDamageInfectionTrigger = function() {
        return this.subject().hasMpDamageTrigger();
    };

    Game_Action.prototype.isTpDamageInfectionTrigger = function() {
        return this.subject().hasTpDamageTrigger();
    };

    var _Game_Action_executeHpDamage = Game_Action.prototype.executeHpDamage;
    Game_Action.prototype.executeHpDamage = function(target, value) {
        _Game_Action_executeHpDamage.bind(this, target, value).call();

        var i;
        var j;

        if(target.hasCurses() && target.hasHpDamageProgressTrigger() && value > 0) {
            var progresses;
            progresses = target.progresses().filter(function(elem) {
                return elem.hasHpDamageTrigger();
            });
            var triggerId;
            var curseId;
            for(i=0;i<progresses.length;i++) {
                curseId = progresses[i].curseId;
                var triggers = progresses[i].triggers();
                for(j=0;j<triggers.length;j++) {
                    if (triggers[j].isHpDamage()) {
                        triggerId = triggers[j].id;
                    }
                }

                if(curseId && triggerId) {
                    target.progressGrowUp(triggerId, curseId);
                }
            }
        }

        if(this.isInfection() && this.isHpDamageInfectionTrigger() && value > 0) {
            var curses;
            curses = this.subject().curses().filter(function(elem) {
                return elem.hasHpDamageTrigger();
            });
            var curseId;
            var triggerId;
            for(i=0;i<curses.length;i++) {
                curseId = curses[i].id;
                var triggers = curses[i].triggers();
                for(j=0;j<triggers.length;j++) {
                    if (triggers[j].isHpDamage()) {
                        triggerId = triggers[j].id;
                    }
                }
                if(curseId && triggerId) {
                    target.receiveInfection(curseId, triggerId);
                }
            }
        }
    };

    var _Game_Action_executeMpDamage = Game_Action.prototype.executeMpDamage;
    Game_Action.prototype.executeMpDamage = function(target, value) {
        _Game_Action_executeMpDamage.bind(this, target, value).call();

        var i;
        var j;

        if(target.hasCurses() && target.hasMpDamageProgressTrigger() && value > 0) {
            var progresses;
            progresses = target.progresses().filter(function(elem) {
                return elem.hasMpDamageTrigger();
            });
            var triggerId;
            var curseId;
            for(i=0;i<progresses.length;i++) {
                curseId = progresses[i].curseId;
                var triggers = progresses[i].triggers();
                for(j=0;j<triggers.length;j++) {
                    if (triggers[j].isMpDamage()) {
                        triggerId = triggers[j].id;
                    }
                }

                if(curseId && triggerId) {
                    target.progressGrowUp(triggerId, curseId);
                }
            }
        }

        if(this.isInfection() && this.isMpDamageInfectionTrigger() && value > 0) {
            var curses;
            curses = this.subject().curses().filter(function(elem) {
                return elem.hasMpDamageTrigger();
            });
            var curseId;
            var triggerId;
            for(i=0;i<curses.length;i++) {
                curseId = curses[i].id;
                var triggers = curses[i].triggers();
                for(j=0;j<triggers.length;j++) {
                    if (triggers[j].isMpDamage()) {
                        triggerId = triggers[j].id;
                    }
                }
                if(curseId && triggerId) {
                    target.receiveInfection(curseId, triggerId);
                }
            }
        }
    };

    var _Game_Action_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        _Game_Action_apply.bind(this, target).call();

        // this.item.note を解析してあれこれする処理
        var source = this.item().note;
        var cureCursePattern = new RegExp('cureCurseId:(\\d+)', 'g');
        var curseId;

        if(cureCursePattern.test(source)) {
            cureCursePattern = new RegExp('cureCurseId:(\\d+)', 'g');
            curseId = cureCursePattern.exec(source)[1];
            target.cureCurse(this, curseId);
        }

    }

    DataManager._databaseFiles.push(
        {name:  '$dataAntiCurses',  src:    'AntiCurses.json'},
        {name:  '$dataCurses',  src:    'Curses.json'},
        {name:  '$dataProgress',  src:    'Progress.json'},
        {name:  '$dataTriggers',  src:    'Triggers.json'}
    );


    // 外部へエクスポート
    var Accessor = {};
    // Accessor.start = Majinai.addCurse.bind(Majinai);

    Imported.Majinai = Accessor;


    /* クロージャの関数をテスト用にエクスポート
     * NOTE: NWjs で実行する際にエラーにならないように try catch 構文を使っています。
     * もっとスマートな実装方法がないかな。
     */
    try {
        if (isTest) {
            exports.AntiCurse = AntiCurse;
            exports.Curse = Curse;
            exports.Progress = Progress;
            exports.Trigger = Trigger;
            exports.Terms = Terms;

        }
    }
    catch(e) {
    }
})();
