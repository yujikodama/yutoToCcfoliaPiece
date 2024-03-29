//グローバル変数
const skillList={
  lvFig:{
    name:'ファイター',
    damageAbility:'筋力',
    hitAbility:'器用度',
    chatPaletteType:[`physics`],    
  },
  lvGra:{
    name:'グラップラー',
    damageAbility:'筋力',
    hitAbility:'器用度',
    chatPaletteType:[`physics`],
  },
  lvBat:{
    name:'バトルダンサー',
    damageAbility:'筋力',
    hitAbility:'器用度',
    chatPaletteType:[`physics`],
  },
  lvFen:{
    name:'フェンサー',
    damageAbility:'筋力',
    hitAbility:'器用度',
    chatPaletteType:[`physics`],    
  },
  lvSho:{
    name:'シューター',
    damageAbility:'筋力',
    hitAbility:'器用度',
    chatPaletteType:[`physics`],    
  },
  lvSor:{
    name:'ソーサラー',
    damageAbility:'知力',
    hitAbility:'知力',
    chatPaletteType:[`magic`],
  },
  lvCon:{
    name:'コンジャラー',
    damageAbility:'知力',
    hitAbility:'知力',
    chatPaletteType:[`magic`],
  },
  lvPri:{
    name:'プリースト',
    damageAbility:'知力',
    hitAbility:'知力',
    chatPaletteType:[`magic`],
  },
  lvFai:{
    name:'フェアリーテイマー',
    damageAbility:'知力',
    hitAbility:'知力',
    chatPaletteType:[`magic`],
  },
  lvMag:{
    name:'マギテック',
    damageAbility:'知力',
    hitAbility:'知力',
    chatPaletteType:[`magic`],
  },
  lvDru:{
    name:'ドルイド',
    damageAbility:'知力',
    hitAbility:'知力',
    chatPaletteType:[`druid`],
  },
  lvDem:{
    name:'デーモンルーラー',
    damageAbility:'知力',
    hitAbility:'知力',
    chatPaletteType:[`magic`],
  },
  lvSco:{
    name:'スカウト',
    damageAbility:'',
    hitAbility:'',
    chatPaletteType:[`other`],
  },
  lvRan:{
    name:'レンジャー',
    damageAbility:'',
    hitAbility:'',
    chatPaletteType:[`other`],
  },
  lvSag:{
    name:'セージ',
    damageAbility:'',
    hitAbility:'',
    chatPaletteType:[`other`],
  },
  lvEnh:{
    name:'エンハンサー',
    damageAbility:'',
    hitAbility:'',
    chatPaletteType:[`other`],
  },
  lvBar:{
    name:'バード',
    damageAbility:'精神',
    hitAbility:'精神',
    chatPaletteType:[`magic`,`other`],
  },
  lvRid:{
    name:'ライダー',
    damageAbility:'',
    hitAbility:'',
    chatPaletteType:[`other`],
  },
  lvAlc:{
    name:'アルケミスト',
    damageAbility:'',
    hitAbility:'',
    chatPaletteType:`other`,
  },
  lvGeo:{
    name:'ジオマンサー',
    damageAbility:'',
    hitAbility:'',
    chatPaletteType:`other`,
  },
  lvWar:{
    name:'ウォーリーダー',
    damageAbility:'',
    hitAbility:'',
    chatPaletteType:`other`,
  },
};
const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
const sheet=spreadsheet.getSheetByName('convertCharacter'); 
//キャラ作成
function createCharacter() { 
  //既存のセルを初期化
  sheet.getRange("B4").setValue("");
  sheet.getRange("B5").setValue("");
  let yutoData=getYutoData();
  //ccfoliaAPI(https://docs.ccfolia.com/developer-api/clipboard-api)
  let ccfoliaAPICharacter={
    kind:"character",
    data:{
      name:yutoData.characterName,
      externalUrl:sheet.getRange("B1").getValue(),
      status:[
        {label:"HP",value:yutoData.hpTotal,max:yutoData.hpTotal},
        {label:"MP",value:yutoData.mpTotal,max:yutoData.mpTotal},
        {label:"防護点",value:yutoData.defenseTotalAllDef,max:yutoData.defenseTotalAllDef},
        {label:"1ゾロ",value:0,max:0},
        {label:"生命抵抗",value:yutoData.vitResistTotal,max:yutoData.vitResistTotal},
        {label:"精神抵抗",value:yutoData.mndResistTotal,max:yutoData.mndResistTotal},
      ],
      params:[
        {label:"器用度",value:yutoData.bonusDex},
        {label:"敏捷度",value:yutoData.bonusAgi},
        {label:"筋力",value:yutoData.bonusStr},
        {label:"生命",value:yutoData.bonusVit},
        {label:"知力",value:yutoData.bonusInt},
        {label:"精神",value:yutoData.bonusMnd},
      ],
      memo:`種族:${yutoData.race==undefined?'':yutoData.race}
プレイヤー:${yutoData.playerName==undefined?'':yutoData.playerName}
性別:${yutoData.gender==undefined?'':yutoData.gender}
年齢:${yutoData.age==undefined?'':yutoData.age}
生まれ:${yutoData.birth==undefined?'':yutoData.birth}
信仰:${yutoData.faith==undefined?'':yutoData.faith}`,
      commands:"",
      initiative:Number(yutoData.mobilityTotal),
    },
  };
  
  //技能のラベルを生成する
  for(const key in skillList) {
    if (key in yutoData) ccfoliaAPICharacter.data.params.push({label:skillList[key].name,value:yutoData[key]})
  }
  //補正用のラベルを別途追加(ステータスに移行する場合一番下にあった方が良いデータ)
  ccfoliaAPICharacter.data.params.push({label:"回避補正",value:'0'});
  ccfoliaAPICharacter.data.params.push({label:"命中補正",value:'0'});
  ccfoliaAPICharacter.data.params.push({label:"威力補正",value:'0'});
  
  //チャットパレット出力
  ccfoliaAPICharacter.data.commands=createChatPalette(yutoData).flat().join('\n')

  sheet.getRange("B4").setValue(JSON.stringify(ccfoliaAPICharacter));
}

//チャパレ作成
function createChatPalette(argData=""){
  //既存のセルを初期化
  sheet.getRange("B5").setValue("");
  let yutoData=argData=="" ? getYutoData() : argData;

  //コマンドパレット格納配列
  let commandsList=[
    '2d 【平目】',
    `2d+{生命抵抗} 【生命抵抗判定】`,
    `2d+{精神抵抗} 【精神抵抗判定】`,
    ':HP',
    ':MP',
    ':1ゾロ+1'
  ];

  //回避技能の設定があれば回避コマンド作成
  if(yutoData.evasionClass!==undefined){
    commandsList.push(`2d+{${yutoData.evasionClass}}+{敏捷度}+{回避補正} 【回避力判定】`)
  }

  for(const key in skillList) {
    if (key in yutoData){
      if(skillList[key].chatPaletteType.includes('other')) commandsList.push(othersPackage(key,yutoData));
      if(skillList[key].chatPaletteType.includes('physics')) commandsList.push(physicsDamageAndhit(key,yutoData));
      if(skillList[key].chatPaletteType.includes('magic')) commandsList.push(magicDamageAndhit(key,yutoData));
      if(skillList[key].chatPaletteType.includes('druid')) commandsList.push(druidDamageAndhit(key,yutoData));
      
    } 
  }
  sheet.getRange("B5").setValue(commandsList.flat().join('\n'));
  return commandsList;
}

//ゆとしーとからデータ取得
getYutoData=()=>{
  //ゆとしーとのURL+JSONAPI生成
  let response
  if(sheet.getRange("B3").getValue()===""){
    let url=`${sheet.getRange("B1").getValue()}&mode=json`;
    //API実行(https://yutorize.2-d.jp/?ytsheet2-json#keylist-sw2)
    response = JSON.parse(UrlFetchApp.fetch(url).getContentText());
    if(response.result.match(/リクエストされたシートは見つかりませんでした/)){
      throw response.result
    }
  }else{
    response=JSON.parse(sheet.getRange("B3").getValue());
  }
  // console.log(JSON.stringify(response))
  return response;
}

physicsDamageAndhit = (skill,mainData) =>  {
  let rtnArr=[];
  if ('weaponNum' in mainData) {
    for(var i=1;i<=mainData.weaponNum;i++){
      if(mainData[`weapon${i}Class`]===skillList[skill].name){
        //参照する値でundefind(未入力)の場合変換する
        let weaponData={
          //命中力
          Acc:mainData[`weapon${i}Acc`]==undefined?0:mainData[`weapon${i}Acc`],
          //用法
          Usage:mainData[`weapon${i}Usage`]==undefined?'':mainData[`weapon${i}Usage`],
          //名前
          Name:mainData[`weapon${i}Name`]==undefined?'':mainData[`weapon${i}Name`],
          //カテゴリ
          Category:mainData[`weapon${i}Category`]==undefined?'':mainData[`weapon${i}Category`],
          //C値
          Crit:mainData[`weapon${i}Crit`]==undefined?13:mainData[`weapon${i}Crit`],
          //威力
          Rate:mainData[`weapon${i}Rate`]==undefined?0:mainData[`weapon${i}Rate`],
          //追加ダメージ
          Dmg:mainData[`weapon${i}Dmg`]==undefined?0:mainData[`weapon${i}Dmg`],
        }

        //命中判定
        rtnArr.push(`2d+{${skillList[skill].name}}+{${skillList[skill].hitAbility}}+{命中補正}+${weaponData.Acc} 【命中力判定/${weaponData.Usage}(${weaponData.Name})】`);
        //ガン以外        
        if(weaponData.Category!=='ガン'){
          //フェンサーの場合はC値-1しておく
          crit= skill=='lvFen'?String(Number(weaponData.Crit)-1):weaponData.Crit
          rtnArr.push(`k${weaponData.Rate}+{${skillList[skill].name}}+{${skillList[skill].damageAbility}}+{威力補正}+${weaponData.Dmg}@${crit} 【威力${weaponData.Rate}/${weaponData.Usage}(${weaponData.Name})】`)
        //ガンの場合
        }else{
          //マギテック技能有
          if('lvMag' in mainData){
            rtnArr.push(`k${weaponData.Rate}+{マギテック}+{知力}+{威力補正}@10 【威力${weaponData.Rate}/${weaponData.Usage}(${weaponData.Name})】`)
          }
        }
      }
    }
  }
  return rtnArr;
};

magicDamageAndhit = (skill,mainData) =>  {
  let rtnArr=[];
  rtnArr.push(`2d+{${skillList[skill].name}}+{${skillList[skill].hitAbility}} 【${skillList[skill].name}行使判定】`);
  rtnArr.push(`k10+{${skillList[skill].name}}+{${skillList[skill].damageAbility}}@10 【${skillList[skill].name}威力判定/威力10】`)
  rtnArr.push(`k10+{${skillList[skill].name}}+{${skillList[skill].damageAbility}}@13 【${skillList[skill].name}回復判定/威力10】`)
  return rtnArr;
}

druidDamageAndhit = (skill,mainData) =>  {
  let rtnArr=[];
  rtnArr.push(`2d+{${skillList[skill].name}}+{${skillList[skill].hitAbility}} 【${skillList[skill].name}行使判定】`);
  rtnArr.push(`k10+{${skillList[skill].name}}+{${skillList[skill].damageAbility}}@10 【${skillList[skill].name}威力判定/威力10】`)
  rtnArr.push(`k10+{${skillList[skill].name}}+{${skillList[skill].damageAbility}}@13 【${skillList[skill].name}回復判定/威力10】`)
  rtnArr.push(`Dru[0,3,6]+{${skillList[skill].name}}+{${skillList[skill].damageAbility}} 【ウルフバイト】`)
  rtnArr.push(`Dru[4,7,13]+{${skillList[skill].name}}+{${skillList[skill].damageAbility}} 【ソーンバッシュ】`)
  return rtnArr;
}

othersPackage=(skill,mainData) =>  {
  let rtnArr=[];
      switch (skill){
        //スカウト
        case 'lvSco' :
          rtnArr.push(`2d+{${skillList[skill].name}}+{器用度} 【スカウト技巧判定】スリ/変装/隠蔽/解除/罠設置`);
          rtnArr.push(`2d+{${skillList[skill].name}}+{敏捷度} 【スカウト運動判定】先制/受け身/隠密/軽業/登攀/尾行`);
          rtnArr.push(`2d+{${skillList[skill].name}}+{知力} 【スカウト観察判定】宝物鑑定/足跡追跡/異常感知/聞き耳/危険感知/探索/天候予測/罠回避/地図作製`);
          break;
        //レンジャー
        case 'lvRan' :
          rtnArr.push(`2d+{${skillList[skill].name}}+{器用度} 【レンジャー技巧判定】応急手当/隠蔽/解除*/罠設置* (*は自然環境のみ)`);
          rtnArr.push(`2d+{${skillList[skill].name}}+{敏捷度} 【レンジャー運動判定】受け身/隠密/軽業/登攀/尾行`);
          rtnArr.push(`2d+{${skillList[skill].name}}+{知力} 【レンジャー観察判定】病気知識/薬品学/足跡追跡/異常感知*/聞き耳/危険感知/探索*/天候予測/罠回避*/地図作製* (*は自然環境のみ)`);
          rtnArr.push(`k10+{${skillList[skill].name}}+{器用度}@13 【薬草／威力10(救命草)】`);
          rtnArr.push(`k0+{${skillList[skill].name}}+{器用度}@13 【薬草／威力0(魔香草)】`);
          rtnArr.push(`k20+{${skillList[skill].name}}+{知力}@13 【ポーション／威力20(ヒーリングポーション】`);
          break;
        //セージ
        case 'lvSag' :
          rtnArr.push(`2d+{${skillList[skill].name}}+{知力} 【セージ知識判定】見識/文献/魔物知識/文明鑑定/宝物鑑定/病気知識/薬品学/地図作製`);
          break;
        //ライダー
        case 'lvRid' :
          rtnArr.push(`2d+{${skillList[skill].name}}+{器用度} 【応急手当判定】`);
          rtnArr.push(`2d+{${skillList[skill].name}}+{敏捷度} 【ライダー運動判定】受け身/騎乗`);
          rtnArr.push(`2d+{${skillList[skill].name}}+{知力} 【ライダー知識判定】弱点隠蔽/魔物知識*/地図作製 (*弱点不可)`);
          rtnArr.push(`2d+{${skillList[skill].name}}+{知力} 【ライダー観察判定*】足跡追跡/異常感知/危険感知/探索/罠回避 (*要【探索指令】)`);
          break;
        //アルケミスト
        case 'lvAlc' :
          rtnArr.push(`2d+{${skillList[skill].name}}+{知力} 【アルケミスト知識判定】見識/文献/薬品学`);
          rtnArr.push(`2d+{${skillList[skill].name}}+{知力} 【賦術判定】`);
          break;
        //バード
        case 'lvBar' :
          rtnArr.push(`2d+{${skillList[skill].name}}+{知力} 【バード知識判定】見識`);
          break;
        //ウォーリーダー
        case 'lvWar' :
          rtnArr.push(`2d+{${skillList[skill].name}}+{敏捷度} 【先制判定】`);
          rtnArr.push(`2d+{${skillList[skill].name}}+{知力}+1 【先制判定*】 (*要【軍師の知略】)`);
          break;
        //ジオマンサー
        case 'lvGeo' :
          rtnArr.push(`2d+{${skillList[skill].name}}+{知力} 【ジオマンサー観察判定】探索/天候予測`);
          break;
        default:
      }
  return rtnArr;
}


//スプレッドシート読み込み時に実行
function onOpen() {
  //メニューバーにJSON出力用メニューを追加
  var entries = [{
    name : "キャラ駒作成",
    functionName : "createCharacter"
  },
  {
    name : "チャパレ作成",
    functionName : "createChatPalette"
  }];
  spreadsheet.addMenu("駒作成", entries);
};
