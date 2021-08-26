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
};
const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
const sheet=spreadsheet.getSheetByName('convertPiece'); 
//キャラ作成
function createCharacter() { 
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
      ],
      params:[
        {label:"器用度",value:yutoData.bonusDex},
        {label:"敏捷度",value:yutoData.bonusAgi},
        {label:"筋力",value:yutoData.bonusStr},
        {label:"生命",value:yutoData.bonusVit},
        {label:"知力",value:yutoData.bonusInt},
        {label:"精神",value:yutoData.bonusMnd},
        {label:"生命抵抗",value:yutoData.vitResistTotal},
        {label:"精神抵抗",value:yutoData.mndResistTotal},
      ],
      memo:`種族:${yutoData.race}
プレイヤー:${yutoData.playerName}`,
      commands:"",
      initiative:Number(yutoData.mobilityTotal),
    },
  };

  //技能のラベルを生成する
  for(const key in skillList) {
    if (key in yutoData) ccfoliaAPICharacter.data.params.push({label:skillList[key].name,value:yutoData[key]})
  }
  //チャットパレット出力
  ccfoliaAPICharacter.data.commands=createChatPalette(yutoData).flat().join('\n')

  sheet.getRange("B2").setValue(JSON.stringify(ccfoliaAPICharacter));
}

//チャパレ作成
function createChatPalette(argData=""){
  let yutoData=argData=="" ? getYutoData() : argData;

  //コマンドパレット格納配列
  let commandsList=[
    `2d+{生命抵抗}`,
    `2d+{精神抵抗}`,
  ];
  if(Number(yutoData.defenseTotal1Eva)!==0){
    commandsList.push(`2d+${yutoData.defenseTotal1Eva} 【回避力判定】`)
  }
  for(const key in skillList) {
    if (key in yutoData){
      if(skillList[key].chatPaletteType.includes('other')) commandsList.push(othersPackage(key,yutoData));
      if(skillList[key].chatPaletteType.includes('physics')) commandsList.push(physicsDamageAndhit(key,yutoData));
      if(skillList[key].chatPaletteType.includes('magic')) commandsList.push(magicDamageAndhit(key,yutoData));
      
    } 
  }
  sheet.getRange("B3").setValue(commandsList.flat().join('\n'));
  return commandsList;
}

//ゆとしーとからデータ取得
getYutoData=()=>{
  //ゆとしーとのURL+JSONAPI生成
  let url=`${sheet.getRange("B1").getValue()}&mode=json`;
  //API実行(https://yutorize.2-d.jp/?ytsheet2-json#keylist-sw2)
  let response = JSON.parse(UrlFetchApp.fetch(url).getContentText());
  if(response.result.match(/リクエストされたシートは見つかりませんでした/)){
    throw response.result
  }
  return response;
}

physicsDamageAndhit = (skill,mainData) =>  {
  let rtnArr=[];
  if ('weaponNum' in mainData) {
    for(var i=1;i<=mainData.weaponNum;i++){
      if(mainData[`weapon${i}Class`]===skillList[skill].name){
        rtnArr.push(`2d+{${skillList[skill].name}}+{${skillList[skill].hitAbility}} 【命中力判定/${mainData[`weapon${i}Usage`]}(${mainData[`weapon${i}Name`]})】`);
        //ガン以外
        if(mainData[`weapon${i}Category`]!=='ガン'){
          rtnArr.push(`k${mainData[`weapon${i}Rate`]}+{${skillList[skill].name}}+{${skillList[skill].damageAbility}}@${mainData[`weapon${i}Crit`]} 【威力${mainData[`weapon${i}Rate`]}/${mainData[`weapon${i}Usage`]}(${mainData[`weapon${i}Name`]})】`)
        //ガンの場合
        }else{
          //マギテック技能有
          if('lvMag' in mainData){
            rtnArr.push(`k${mainData[`weapon${i}Rate`]}+{マギテック}+{知力}@${mainData[`weapon${i}Crit`]} 【威力${mainData[`weapon${i}Rate`]}/${mainData[`weapon${i}Usage`]}(${mainData[`weapon${i}Name`]})】`)
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