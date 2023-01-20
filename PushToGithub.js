const cp        = require("node:child_process")
const readline  = require("readline")
const cli       = require("cli-color")

const pms       = require("../Hachan/pretty-ms/index.js");


const {
    art,                beep,               blink, 
    bold,               columns,            erase, 
    getStrippedLength,  inverse,            italic, 
    move,               reset,              slice, 
    strike,             strip,              throbber, 
    underline,          windowSize,         xterm, 
    bgXterm,            xtermSupported,
    

    bgBlack,            bgBlackBright,  bgBlue,
    bgBlueBright,       bgCyan,         bgCyanBright,
    bgGreen,            bgGreenBright,  bgMagenta,
    bgMagentaBright,    bgRed,          bgRedBright,
    bgWhite,            bgWhiteBright,  bgYellow,
    bgYellowBright, 
    


    black,          blackBright,    blue, 
    blueBright,     cyan,           cyanBright,
    green,          greenBright,    magenta, 
    magentaBright,  red,            redBright,      
    white,          whiteBright,    yellow,
    yellowBright
} = cli;


const rl = readline.createInterface({
    input   : process.stdin,
    output  : process.stdout,
    terminal: false
});


let ScheduledEnd = false;

async function Main () 
{

    rl.question("", (answer) => {
        if (answer === "end") {
            ScheduledEnd = true;
            console.log(red("Scheduled End"));
        } else

        if (answer === "noend") {
            ScheduledEnd = false;
            console.log(green("Removed Scheduled End"));
        }
    });

    


    const UnstagedFiles = cp.execSync("git ls-files -o -m").toString().trim().split("\n");


    const ignore = ["important/", "node_modules/"];

    const UnstagedImageFiles = UnstagedFiles
        .filter(file => !(ignore.some(ig => file.startsWith(ig))))


    console.log(`==> ${yellowBright(UnstagedFiles.length)} files to push`)


    CheckScheduledEnd();


    const push_id = Math.floor(Math.random() * 10000);
    const commit_msg = (batch_no, files, type) => `"[${push_id}] ${type} | Batch: ${batch_no} | Files: ${files}"`;


    let   CurrentDir = 0;
    const ImageDirsToPush = split_arr_by(UnstagedImageFiles, 100);
    
    for (const dir of ImageDirsToPush) {
        CurrentDir++;


        let TimeStart = Date.now();

        console.log(`[Image ${red(CurrentDir)} / ${ImageDirsToPush.length}] Starting ...`);

        add_commit_push(dir, CurrentDir, ImageDirsToPush.length, "Image");

        console.log(`[Image ${red(CurrentDir)} / ${ImageDirsToPush.length}] Completed in ${red(pms(Date.now() - TimeStart, { verbose: true }))}`);



        CheckScheduledEnd();
    }


    console.log(cli.green("Pushed All Files"));
    rl.close();



    function CheckScheduledEnd () {
        if (ScheduledEnd) {
            console.log(red("Schduled End"));
            process.kill(process.pid);
        }
    }

    function add_commit_push (dirs, CurrentIndex, Indexes, type) {
            const dirs_to_push  = dirs;
            const label         = `[${type} ${red(CurrentIndex)} / ${Indexes}]`


            console.log(`${label} Status: ${green("Git Add")}`);
            cp.execSync(`git add ${dirs_to_push.map(d => `${d.startsWith('"') ? "" : '"'}${d}${d.endsWith('"') ? "" : '"'}`).join(" ")}`, {stdio: 'inherit'});

            
            console.log(`${label} Status: ${yellowBright("Git Commit")}`);
            cp.execSync(`git commit -m ${commit_msg(CurrentIndex, dirs.length, type)}`, {stdio: 'inherit'});

            
            console.log(`${label} Status: ${red("Git Push")}`);
            cp.execSync(`git push -u origin main`, {stdio: 'inherit'});

            console.log(`[Status] ${dirs_to_push.length} Pushed`);
    }


    function split_arr_by (arr, by) {
        let cache   = [];
        let left    = by;
        
        const dirs = [];

        let i = 0;
        for (const dir of arr) {
            cache.push(dir);
            left -= 1;

            if (left <= 0 || i === (arr.length - 1)) {
                dirs.push(cache);
                cache = [];
                left = by;
            }

            i++;
        }

        return dirs;
    }
}


Main().then();