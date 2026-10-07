(() => {
  const BLOCKS = {
    kc_on_start: {label:"Bij de start", category:"Gebeurtenissen", colour:45},
    kc_on_button: {label:"Als knop %1 wordt ingedrukt", category:"Gebeurtenissen", colour:45},
    kc_forever: {label:"Blijf herhalen", category:"Gebeurtenissen", colour:45},
    kc_show_icon: {label:"Toon pictogram %1", category:"Leds", colour:205},
    kc_show_number: {label:"Toon getal %1", category:"Leds", colour:205},
    kc_clear_leds: {label:"Wis het ledscherm", category:"Leds", colour:205},
    kc_play_melody: {label:"Speel melodie %1", category:"Muziek", colour:285},
    kc_play_note: {label:"Speel noot %1 gedurende %2", category:"Muziek", colour:285},
    kc_set_volume: {label:"Zet volume op %1 %", category:"Muziek", colour:285},
    kc_pause: {label:"Wacht %1 ms", category:"Besturen", colour:20},
    kc_repeat: {label:"Herhaal %1 keer", category:"Besturen", colour:20}
  };
  const icons = {
    hart:["01010","11111","11111","01110","00100"],
    glimlach:["00000","01010","00000","10001","01110"],
    lach:["01010","00000","10001","10001","01110"],
    verdrietig:["01010","00000","01110","10001","10001"],
    ja:["00001","00010","10100","01000","00000"],
    ster:["00100","10101","01110","11111","01010"],
    diamant:["00100","01110","11111","01110","00100"]
  };
  const digits = {
    "0":["01110","10001","10011","10101","01110"],"1":["00100","01100","00100","00100","01110"],
    "2":["01110","10001","00110","01000","11111"],"3":["11110","00001","00110","00001","11110"],
    "4":["00010","00110","01010","11111","00010"],"5":["11111","10000","11110","00001","11110"],
    "6":["01110","10000","11110","10001","01110"],"7":["11111","00010","00100","01000","01000"],
    "8":["01110","10001","01110","10001","01110"],"9":["01110","10001","01111","00001","01110"],
    "-": ["00000","00000","11111","00000","00000"]
  };
  const noteHz={C4:262,D4:294,E4:330,F4:349,G4:392,A4:440,B4:494,C5:523,D5:587,E5:659,F5:698,G5:784,A5:880,B5:988};
  const melodies={
    "Korte tune":[[523,1],[659,1],[784,2],[659,1],[523,2]],
    "Vrolijk": [[523,1],[659,1],[784,1],[1047,2],[784,1],[1047,3]],
    "Aftellen": [[784,1],[659,1],[523,1],[392,2]],
    "Verjaardag": [[523,1],[523,1],[587,2],[523,2],[698,2],[659,4]],
    "Start": [[392,1],[523,1],[659,1],[784,3]],
    "Stop": [[784,1],[523,1],[392,3]]
  };
  const melodyNotes={
    "Korte tune":"C5 E5 G5 E5 C5",
    "Vrolijk":"C5 E5 G5 C6 G5 C6",
    "Aftellen":"G5 E5 C5 G4",
    "Verjaardag":"C5 C5 D5 C5 F5 E5",
    "Start":"G4 C5 E5 G5",
    "Stop":"G5 C5 G4"
  };

  let audioContext;
  let currentWorkspace;
  let workspaceChange;
  let enabledBlocks=Object.keys(BLOCKS);
  let running=false;
  let runToken=0;
  let volume=.6;
  let ledTimer;

  function defineBlocks() {
    Blockly.Blocks.kc_on_start={init(){this.appendDummyInput().appendField("bij de start");this.appendStatementInput("DO");this.setStyle("logic_blocks");this.setTooltip("Voer deze blokken uit zodra je het programma start.");}};
    Blockly.Blocks.kc_on_button={init(){this.appendDummyInput().appendField("als knop").appendField(new Blockly.FieldDropdown([["A","A"],["B","B"],["A en B","AB"]]),"BUTTON").appendField("wordt ingedrukt");this.appendStatementInput("DO");this.setStyle("logic_blocks");this.setTooltip("Voer deze blokken uit wanneer je op knop A of B drukt.");}};
    Blockly.Blocks.kc_forever={init(){this.appendDummyInput().appendField("blijf herhalen");this.appendStatementInput("DO");this.setStyle("logic_blocks");this.setTooltip("Blijf de blokken in dit vak uitvoeren.");}};
    Blockly.Blocks.kc_show_icon={init(){this.appendDummyInput().appendField("toon pictogram").appendField(new Blockly.FieldDropdown([["hart","hart"],["glimlach","glimlach"],["lach","lach"],["verdrietig","verdrietig"],["ja","ja"],["ster","ster"],["diamant","diamant"]]),"ICON");this.setPreviousStatement(true);this.setNextStatement(true);this.setStyle("math_blocks");this.setTooltip("Laat een pictogram zien op het ledscherm.");}};
    Blockly.Blocks.kc_show_number={init(){this.appendDummyInput().appendField("toon getal").appendField(new Blockly.FieldNumber(1,-9,9,1),"VALUE");this.setPreviousStatement(true);this.setNextStatement(true);this.setStyle("math_blocks");this.setTooltip("Laat een getal zien op het ledscherm.");}};
    Blockly.Blocks.kc_clear_leds={init(){this.appendDummyInput().appendField("wis het ledscherm");this.setPreviousStatement(true);this.setNextStatement(true);this.setStyle("math_blocks");this.setTooltip("Zet alle leds uit.");}};
    Blockly.Blocks.kc_play_melody={init(){this.appendDummyInput().appendField("speel melodie").appendField(new Blockly.FieldDropdown(Object.keys(melodies).map(x=>[x,x])),"MELODY");this.setPreviousStatement(true);this.setNextStatement(true);this.setStyle("text_blocks");this.setTooltip("Speel een korte melodie via de micro:bit-speaker.");}};
    Blockly.Blocks.kc_play_note={init(){this.appendDummyInput().appendField("speel noot").appendField(new Blockly.FieldDropdown(Object.keys(noteHz).map(x=>[x,x])),"NOTE").appendField("gedurende").appendField(new Blockly.FieldDropdown([["kort","0.25"],["1 tel","1"],["2 tellen","2"]]),"BEATS");this.setPreviousStatement(true);this.setNextStatement(true);this.setStyle("text_blocks");this.setTooltip("Speel één muzieknoot.");}};
    Blockly.Blocks.kc_set_volume={init(){this.appendDummyInput().appendField("zet volume op").appendField(new Blockly.FieldDropdown([["25","25"],["50","50"],["75","75"],["100","100"]]),"VOLUME").appendField("%");this.setPreviousStatement(true);this.setNextStatement(true);this.setStyle("text_blocks");this.setTooltip("Kies hoe hard de micro:bit klinkt.");}};
    Blockly.Blocks.kc_pause={init(){this.appendDummyInput().appendField("wacht").appendField(new Blockly.FieldNumber(500,0,10000,100),"MS").appendField("milliseconden");this.setPreviousStatement(true);this.setNextStatement(true);this.setStyle("loop_blocks");this.setTooltip("Wacht even voordat het volgende blok start.");}};
    Blockly.Blocks.kc_repeat={init(){this.appendDummyInput().appendField("herhaal").appendField(new Blockly.FieldNumber(4,1,20,1),"TIMES").appendField("keer");this.appendStatementInput("DO");this.setPreviousStatement(true);this.setNextStatement(true);this.setStyle("loop_blocks");this.setTooltip("Herhaal de blokken in dit vak meerdere keren.");}};

    const gen=window.javascript?.javascriptGenerator||Blockly.JavaScript;
    if(!gen) return;
    gen.forBlock.kc_on_start=b=>`// Bij de start\n${gen.statementToCode(b,"DO")}`;
    gen.forBlock.kc_on_button=b=>`input.onButtonPressed(Button.${b.getFieldValue("BUTTON")}, function () {\n${gen.statementToCode(b,"DO")}});\n`;
    gen.forBlock.kc_forever=b=>`basic.forever(function () {\n${gen.statementToCode(b,"DO")}});\n`;
    gen.forBlock.kc_show_icon=b=>`basic.showIcon(IconNames.${({hart:"Heart",glimlach:"Happy",lach:"Happy",verdrietig:"Sad",ja:"Yes",ster:"SmallDiamond",diamant:"Diamond"})[b.getFieldValue("ICON")]});\n`;
    gen.forBlock.kc_show_number=b=>`basic.showNumber(${b.getFieldValue("VALUE")});\n`;
    gen.forBlock.kc_clear_leds=()=>"basic.clearScreen();\n";
    gen.forBlock.kc_play_melody=b=>`music.playMelody("${melodyNotes[b.getFieldValue("MELODY")]}", 120);\n`;
    gen.forBlock.kc_play_note=b=>`music.playTone(${noteHz[b.getFieldValue("NOTE")]}, ${Math.round(300*Number(b.getFieldValue("BEATS")))});\n`;
    gen.forBlock.kc_set_volume=b=>`music.setVolume(${Math.round(Number(b.getFieldValue("VOLUME"))*2.55)});\n`;
    gen.forBlock.kc_pause=b=>`basic.pause(${b.getFieldValue("MS")});\n`;
    gen.forBlock.kc_repeat=b=>`for (let index = 0; index < ${b.getFieldValue("TIMES")}; index++) {\n${gen.statementToCode(b,"DO")}}\n`;
  }

  function toolbox(config) {
    const groups={};
    for(const type of enabledBlocks){const meta=BLOCKS[type];if(!meta)continue;(groups[meta.category] ||= []).push({kind:"block",type});}
    const colors={"Gebeurtenissen":"#f2b632","Leds":"#278889","Muziek":"#79529a","Besturen":"#438ec4"};
    return {kind:"categoryToolbox",contents:Object.entries(groups).map(([name,contents])=>({kind:"category",name,colour:colors[name],contents}))};
  }

  function mount({workspaceId,previewId,codeId,saveKey,initialState,blockConfig,onChange}) {
    const root=document.getElementById(workspaceId);
    if(!root||!window.Blockly){if(root)root.innerHTML="<p class='help'>De blokkeneditor kan niet laden. Controleer of Blockly beschikbaar is.</p>";return null;}
    if(currentWorkspace){currentWorkspace.dispose();currentWorkspace=null;}
    enabledBlocks=Array.isArray(blockConfig)?blockConfig:Object.keys(BLOCKS);
    defineBlocks();
    const ws=Blockly.inject(root,{toolbox:toolbox(),trashcan:true,renderer:"zelos",move:{scrollbars:true,drag:true,wheel:true},zoom:{controls:true,wheel:true,startScale:.95,maxScale:1.7,minScale:.55,scaleSpeed:1.1},grid:{spacing:24,length:3,colour:"#e7e2eb",snap:true},sounds:false,oneBasedIndex:false});
    currentWorkspace=ws;
    const saved=initialState||(()=>{try{return JSON.parse(localStorage.getItem(saveKey));}catch{return null;}})();
    if(saved?.blocks)Blockly.serialization.workspaces.load(saved,ws);
    else {
      const start=ws.newBlock("kc_on_start");start.initSvg();start.render();start.moveBy(55,45);
      const icon=ws.newBlock("kc_show_icon");icon.setFieldValue("hart","ICON");icon.initSvg();icon.render();icon.outputConnection?.disconnect();start.getInput("DO").connection.connect(icon.previousConnection);icon.moveBy(0,0);
    }
    const renderCode=()=>{const gen=window.javascript?.javascriptGenerator||Blockly.JavaScript;const code=gen?gen.workspaceToCode(ws):"";const output=document.getElementById(codeId);if(output)output.textContent=code||"// Sleep blokken in de werkruimte.";};
    const save=()=>{const snapshot=Blockly.serialization.workspaces.save(ws);localStorage.setItem(saveKey,JSON.stringify(snapshot));if(onChange)onChange(snapshot);renderCode();};
    ws.addChangeListener(e=>{if(e.isUiEvent)return;save();});
    workspaceChange=save;renderCode();
    const led=document.getElementById(previewId);
    const setLeds=pattern=>{if(!led)return;led.querySelectorAll("[data-led]").forEach((dot,index)=>dot.classList.toggle("lit",!!pattern[Math.floor(index/5)]?.[index%5]&&pattern[Math.floor(index/5)][index%5]==="1"));};
    const clearLeds=()=>setLeds(["00000","00000","00000","00000","00000"]);
    const showNumber=n=>setLeds(digits[String(n)]||digits[String(Math.max(-9,Math.min(9,n)))]);
    const playTone=async(freq,duration,token)=>{
      if(token!==runToken)return;
      try{audioContext ||= new(window.AudioContext||window.webkitAudioContext)();await audioContext.resume();const osc=audioContext.createOscillator();const gain=audioContext.createGain();osc.type="sine";osc.frequency.value=freq;gain.gain.value=volume*.16;osc.connect(gain);gain.connect(audioContext.destination);osc.start();osc.stop(audioContext.currentTime+duration/1000);}
      catch{notifySound();}
      await new Promise(resolve=>setTimeout(resolve,duration));
    };
    const wait=ms=>new Promise(resolve=>setTimeout(resolve,Math.max(20,Math.min(10000,ms))));
    const runStack=async(first,token)=>{let b=first,guard=0;while(b&&token===runToken&&guard++<300){await runBlock(b,token);b=b.getNextBlock();}};
    const runBlock=async(b,token)=>{
      if(token!==runToken)return;
      switch(b.type){
        case "kc_show_icon":setLeds(icons[b.getFieldValue("ICON")]);break;
        case "kc_show_number":showNumber(Number(b.getFieldValue("VALUE")));break;
        case "kc_clear_leds":clearLeds();break;
        case "kc_play_melody":for(const [hz,beats] of melodies[b.getFieldValue("MELODY")])await playTone(hz,160*beats,token);break;
        case "kc_play_note":await playTone(noteHz[b.getFieldValue("NOTE")],Math.round(300*Number(b.getFieldValue("BEATS"))),token);break;
        case "kc_set_volume":volume=Number(b.getFieldValue("VOLUME"))/100;break;
        case "kc_pause":await wait(Number(b.getFieldValue("MS")));break;
        case "kc_repeat":for(let i=0;i<Number(b.getFieldValue("TIMES"))&&token===runToken;i++)await runStack(b.getInputTargetBlock("DO"),token);break;
      }
    };
    const events=()=>ws.getTopBlocks(true).filter(b=>b.type.startsWith("kc_on_"));
    const run=async(button)=>{
      if(running)return;
      running=true;runToken++;const token=runToken;
      document.getElementById("run-program")?.setAttribute("disabled","true");document.getElementById("stop-program")?.removeAttribute("disabled");
      clearLeds();
      const top=events();
      for(const b of top)if(b.type==="kc_on_start")runStack(b.getInputTargetBlock("DO"),token);
      for(const b of top)if(b.type==="kc_forever")runForever(b.getInputTargetBlock("DO"),token);
      activeButton=button=>{for(const b of top)if(b.type==="kc_on_button"&&(b.getFieldValue("BUTTON")===button||b.getFieldValue("BUTTON")==="AB"))runStack(b.getInputTargetBlock("DO"),runToken);};
      document.querySelectorAll("[data-microbit-button]").forEach(btn=>btn.onclick=()=>activeButton(btn.dataset.microbitButton));
      await wait(40);
    };
    let activeButton=()=>{};
    const runForever=async(first,token)=>{while(token===runToken){await runStack(first,token);if(token===runToken)await wait(30);}};
    const stop=()=>{runToken++;running=false;document.getElementById("run-program")?.removeAttribute("disabled");document.getElementById("stop-program")?.setAttribute("disabled","true");clearLeds();};
    document.getElementById("run-program")?.addEventListener("click",()=>run());
    document.getElementById("stop-program")?.addEventListener("click",stop);
    document.getElementById("clear-workspace")?.addEventListener("click",()=>{ws.clear();const block=ws.newBlock("kc_on_start");block.initSvg();block.render();block.moveBy(55,45);});
    document.getElementById("download-code")?.addEventListener("click",()=>{const code=(window.javascript?.javascriptGenerator||Blockly.JavaScript).workspaceToCode(ws);const blob=new Blob([code],{type:"text/plain"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="KlasCode-programma.ts";a.click();URL.revokeObjectURL(url);});
    document.getElementById("toggle-code")?.addEventListener("click",e=>{const panel=document.getElementById(codeId)?.parentElement;const shown=panel?.classList.toggle("is-open");e.currentTarget.setAttribute("aria-expanded",String(!!shown));});
    document.getElementById("microbit-version")?.addEventListener("change",e=>{const speaker=document.querySelector(".microbit-speaker");speaker?.classList.toggle("v1-disabled",e.target.value==="v1");});
    return {getState:()=>Blockly.serialization.workspaces.save(ws),getCode:()=>((window.javascript?.javascriptGenerator||Blockly.JavaScript).workspaceToCode(ws)),dispose:()=>{stop();ws.dispose();if(currentWorkspace===ws)currentWorkspace=null;}};
  }
  function notifySound(){const el=document.getElementById("sound-note");if(el)el.textContent="Je browser kan het geluid niet afspelen. Bekijk de noot op het scherm.";}
  window.KlasCodeEditor={BLOCKS,mount};
})();
