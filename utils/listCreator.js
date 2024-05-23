import fs from 'fs/promises';
import path from 'path';


const BASE = "./"
const INPUT_DIR_PATH = path.relative(BASE, "./ghozitv_lists")
const OUTPUT_DIR_PATH = path.relative(BASE, "./playlists")
const NEW_FILE_PATH = "./personal-iptv/playlists/generated_iptv.m3u"

/** @type {import("fs").ObjectEncodingOptions} */
const ENCODING = { encoding: "utf-8" }


createList()


async function createList() {
    const file_names = await fs.readdir(INPUT_DIR_PATH, ENCODING)
    if (!file_names || !file_names.length) return console.log("No files in dir.")

    const lines_array = await getFilesContent(file_names)
    const channals = createChannelBlocks(lines_array)
    await saveChannels(channals)

    console.log(`${channals.length} channels are saved in file.`)
}

/** @param {Array.<String>} file_names */
function getFilesContent(file_names = []) {
    return new Promise(async (resolve, reject) => {
        if (!file_names.length) return reject("empty imput string")
    
        let main_content = ""
        
        for (let i = 0; i < file_names.length; i++) {
            const file_path = `${INPUT_DIR_PATH}/${file_names[i]}`
            const relative_file_path = path.relative(BASE, file_path)
            
            const file_content = await fs.readFile(relative_file_path, ENCODING)
            main_content = `${main_content}\n${file_content}`
        }

        return resolve(main_content.split("\n"))
    })
}


/** @param {Array.<String>} lines */
function createChannelBlocks(lines = []) {
    if (!lines.length) return
    const channals = []
    let block_lines = []

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        
        if (line !== "" && !line.includes("EXTM3U")) {
            block_lines.push(line)
            
            if (line.startsWith("http", 0)) {
                const channal_block = block_lines.join("\n")
                // const new_channel = !checkIfChannelsExists(channal_block, channals)
                
                channals.push(channal_block)
                console.log(`added channel ${line}`)
                block_lines = []
            }
        }
    }

    return channals
}

/** @param {String} ch_link @param {Array.<String>} channals @returns {Boolean} */
function checkIfChannelsExists(ch_link, channals) {
    if (!channals.length) return false

    for (let i = 0; i < channals.length; i++) {
        const have_channel = channals[i].indexOf(ch_link) > 0
        if (have_channel) {
            console.log("Duplicate channel")
            return true
        }
    }

    return false
}

/** @param {Array.<String>} channals @returns {Promise} */
function saveChannels(channals) {
    const file_content = `#EXTM3U\n\n\n${channals.join('\n')}`
    console.log(NEW_FILE_PATH)
    return fs.writeFile("./generated_iptv.m3u", file_content, ENCODING)
}