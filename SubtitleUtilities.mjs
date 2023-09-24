// documentation: https://abdeladim-s.github.io/subsai/#subsai.models.faster_whisper_model.FasterWhisperModel.model_name

import { executeCommand, move } from "../CoreUtilities/tools.mjs";
import fs from 'fs';
import pathUtil from 'path';

export default class SubsUtils{

    // subsai options
    static subsai = 'C:\\Users\\Usuario\\.pyenv\\pyenv-win\\versions\\3.10.5\\Scripts\\subsai';
    static vidPath = (path) => {        
        return `"${path}"`;
    }
    static fasterWhisper = '--model guillaumekln/faster-whisper';
    static fastWhisperConfig = '--model-configs ' + pathUtil.resolve('src/SubtitleUtilities/configs/transcribeConf.json')
    static subsFormat = '--format srt'
    static subsPathOption = (path) => {
        return `--destination-folder ${path}`
    }

    // ffmpeg options
    static ffmpeg = 'ffmpeg'; // add -y if you want it to overwrite a existing file
    static ffmpegInput = (path) => {
        return `-i "${path}"`;
    }
    static mergeSubsOptions = (videopath, mkvVideoPathTemp, arraySubs, thumbnailPath) => {
        let { ffmpeg, ffmpegInput, subsInput, subsMap, subsCopy, subsMetadata, mergeOutputPath, thumbAttach} = this;
        return `${ffmpeg} ${ffmpegInput(videopath)} ${subsInput(arraySubs)} ${subsMap(arraySubs)} ${subsCopy(arraySubs)} ${subsMetadata(arraySubs)} ${thumbAttach(thumbnailPath)} ${mergeOutputPath(mkvVideoPathTemp)}`;
    }
    static subsInput = (arraySubs) => {
        let subsInputStr = '';
        for(let sub of arraySubs){
            subsInputStr += `-f ${sub.ext} -i "${sub.path}" `
        }
        return subsInputStr.slice(0, -1); //we remove the last white space
    }
    static subsMap = (arraySubs) => {
        let subsMapStr = '-map 0:V -map 0:a ';
        let subMap = 1;
        for(let sub of arraySubs){
            subsMapStr += `-map ${subMap++}:0 `
        }
        return subsMapStr.slice(0, -1); //we remove the last white space
    }
    static subsCopy = (arraySubs) => {
        let subsCopyStr = '-c copy ';
        let subCopy = 0;
        for(let sub of arraySubs){
            subsCopyStr += `-c:s:s:${subCopy++} ${sub.ext} `
        }
        return subsCopyStr.slice(0, -1); //we remove the last white space
    }
    static subsMetadata = (arraySubs) => {
        let subsMetadataStr = '';
        let subMetadata = 0;
        for(let sub of arraySubs){
            subsMetadataStr += `-metadata:s:s:${subMetadata++} language=${sub.lang} `
        }
        return subsMetadataStr.slice(0, -1); //we remove the last white space
    }
    static thumbAttach = (path) => {
        return path ? `-attach "${path}" -metadata:s:t mimetype=image/png` : '';
    }
    static mergeOutputPath = (videoPath) => {
        return `"${videoPath}"`;
    }

    constructor() {
        // Initialize any properties here
    }

    example = 'C:\\Users\\Usuario\\.pyenv\\pyenv-win\\versions\\3.10.5\\Scripts\\subsai "E:\\Users\\Usuario\\Downloads\\test\\『CUE!（キュー）』教導支配 未公開アニメPV.webm" --model guillaumekln/faster-whisper --model-configs E:\\Users\\Usuario\\Downloads\\subsaiconfig.json --format srt --destination-folder E:\\Users\\Usuario\\Downloads\\test2\\';

    static Languages = {
        ENGLISH: "en",
        JAPANESE: "ja",
        SPANISH: "es"
    }

    static async generateSubs(videoLang, videopath, subspathDirectory) {
        const command = this.getGenerateSubsCommand(videoLang, videopath, subspathDirectory);

        return await executeCommand(command); // returns a promise
    }

    static generateTranslatedSubs(videoLang, translateLand, videopath, subspathDirectory) {
        
    }

    static async mergeSubsWithVideo(videoPath, subs, thumbnailPath) {
        const mkvVideoPathWithoutExt = videoPath.replace(/(\.[\w\d_-]+)$/i, ''); //regex made by IA, no idea how it works
        const tempVideoPath = mkvVideoPathWithoutExt + '.temp.mkv';//we do this, because if the videopath and finalvideopath are the same (same extension), the command would give error
        const finalVideoPath = mkvVideoPathWithoutExt + '.mkv';//we do this in case the orig video is not a mkv
        if(!thumbnailPath){
            thumbnailPath = mkvVideoPathWithoutExt + '.png'; //does it need to be cover.png? we will find out sound
            let commandExtractThumbnail = `${this.ffmpeg} -i "${videoPath}" -map 0:v -map -0:V -c copy "${thumbnailPath}"`
            await executeCommand(commandExtractThumbnail);

            if (!fs.existsSync(thumbnailPath)) {
                thumbnailPath = null;
            }
        }

        const command = this.mergeSubsOptions(videoPath, tempVideoPath, subs, thumbnailPath);
        await executeCommand(command);

        return await move(tempVideoPath, finalVideoPath).then(() => new Promise( resolve => resolve( finalVideoPath ) ) );
    }

    static getGenerateSubsCommand(videoLang, videopath, subspath) {
            const { subsai, vidPath, fasterWhisper, fastWhisperConfig, subsFormat, subsPathOption } = this;
    
            return `${subsai} ${vidPath(videopath)} ${fasterWhisper} ${fastWhisperConfig} ${subsFormat} ${subsPathOption(subspath)}`;
    }

    getGenerateSubsTranslationCommand() {


    }


}
