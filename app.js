// ================  CONEXÃO ================ //
const Discord = require("discord.js");
const config = require("./config.json");
const fs = require('fs'); 
const unirest = require("unirest");

const client = new Discord.Client();

// ================  FUNÇÕES ================ //
const prefix = ".";                                     // Prefixo que o utilizador deverá utilizar para que o bot saiba que é um comando designado para ele


client.on("message", function(message) {
    if (message.author.bot) return;                             // Caso seja um bot que enviou uma mensagem, a mensagem irá ser automaticamente ignorada            
    if (!message.content.startsWith(prefix) && !message.content.startsWith("pr") && !message.content.startsWith("br")) return;    // Se a mensagem não começar com o prefixo, o bot automaticamente ignorará

    const commandBody = message.content.slice(prefix.length);   // Irá preencher a constante commandBody com o comando e argumentos, retirando o prefixo (.)
    const args = commandBody.split(' ');                        // Irá preencher a constante com os argumentos, retirando o comando e deixando apenas os argumentos         
    const comando = args.shift().toLowerCase();
    const palavra = message.content;

    // Palavras especiais
    if (palavra.startsWith("pr é gay" ) || palavra.startsWith("pr e gay") || palavra.startsWith("pr ser gay") || palavra.startsWith("pr ser muito") || palavra.startsWith("pr gay")) {
        message.channel.send("Concordo, pr ser muito gay 😎👍");
    } else if (palavra.startsWith("br é") || palavra.startsWith("br ser") || palavra.startsWith("br e")) {
        message.channel.send("BR ser macho 😎👍");
    } else if (palavra.startsWith("pr é corno") || palavra.startsWith("pr ser corno") || palavra.startsWith("pr e corno")) {
        message.channel.send(`MuuuUUUuuuu, tão te chamando pr`);
    } else if (comando === "pr") {
        message.channel.send("", {files: ["https://media.discordapp.net/attachments/726601790493032490/758819065774604311/unknown.png?width=390&height=287"]});
    } else if (comando === "prputo") {
        message.channel.send("", {files: ["https://media.discordapp.net/attachments/726601790493032490/759581919506595852/MELHOR.PNG?width=345&height=303"]});
    } else if (comando === "prgaranhao") {
        message.channel.send("", {files: ["https://media.discordapp.net/attachments/491710539639029780/759946975520227348/unknown.png?width=178&height=383"]});
    } else if (comando === "zepr") {
        message.channel.send("", {files: ["https://media.discordapp.net/attachments/726601790493032490/762113616249880596/ze_mane_PR.png?width=667&height=676"]});
    } else if (comando === "vamoparar") {
        message.channel.send("Vamo parar que já ta feio garaio 🤬");
    }

    // Comandos (.exemplo)
    if (comando === "comandos") {
        mensagemComandos(message);

    } else if (comando === "fut") {
       getNoticias(message, parseInt(args));
        
    } else if (comando === "clear") {
        if (parseInt(args) > 0 && parseInt(args) < 100) {
            limparMensagens(message, parseInt(args));
            } else {
                mensagemErro(message, "Utilize apenas números como parametros (Ex: `.clear 1-99`)");
        }
    }
});


// Funcoes automaticas
client.once('ready', async () => {
    
    setInterval(() => {
        getUltimaNoticia("futbolada");   // Irá enviar a ultima notícia a cada 5 minutos para o canal futbolada(300 000ms)
    }, 300000);
});
  



function getNoticias(message, args) {

    let ultima_noticia = lerTxt("files", "/ultima_noticia.txt");    // Variavel global para guardar a hora da ultima noticia enviada para comparar com a nova em getUltimaNoticia(nome_canal)

    let data = new Date();
    let resultado;
    let noticia;
    let numArtigos = 20 - 1;   // 20 é o número máximo de notícias que a api pode enviar

    let req = unirest("GET", "http://newsapi.org/v2/top-headlines?country=pt&category=sports");

    // Irá limpar as ultimas 99 mensagens para que retire as antigas
    if (!args) {
        if (message.channel.type == 'text') {
                async function clear() {
                    message.delete();
                    const fetched = await message.channel.messages.fetch({limit: 98 + 1});
                    message.channel.bulkDelete(fetched);
                }
            clear();
        }
    }

    req.query({
        "apiKey": "2c7dbc70b80544edbbccb311cf40157b",
    });
    
    req.then((res, error) => {
        if (error) {
            console.log(error);
        }

        (async () => {
            let i;
            let ms = 0;
            let contador = 0;

            if (args > 0 && args < numArtigos) {
                numArtigos = args - 1;
            }

            for(i = numArtigos; i >= 0; i--) {
                resultado = (res.body.articles[i]);

                if (ultima_noticia != resultado.publishedAt) {
                    guardarNoticiaTxt(resultado.publishedAt);
                    
                    noticia = await mensagemEmbed(resultado);
                    await enviarNoticiaDelay(1800, message, noticia);

                    contador++;
                    ms += 2000;
                } else {
                    return;
                }
            }
            console.log(`Foram guardadas e enviadas ${contador} notícia(s) no total. < ${data.getHours()}:${data.getMinutes()}:${data.getSeconds()} >      Requerente: ${message.member.user.tag}`);
        })();
    });
}
  



function getUltimaNoticia(nome_canal) {

    let ultima_noticia = lerTxt("files", "/ultima_noticia.txt");    // Variavel global para guardar a hora da ultima noticia enviada para comparar com a nova em getUltimaNoticia(nome_canal)
    const channel = client.channels.cache.find(channel => channel.name === nome_canal);
    
    try {
        let resultado;
        let noticia;
    
        let req =  unirest("GET", "http://newsapi.org/v2/top-headlines?country=pt&category=sports");
    
        req.query({
            "apiKey": "2c7dbc70b80544edbbccb311cf40157b",
        });
        
        req.then((res, error) => {
            if (error) {
                console.log(error);
            }
    
            (async () => {
                resultado = (res.body.articles[0]);     // 19 determina que o programa irá automaticamente buscar a notícia mais recente
                if (ultima_noticia != resultado.publishedAt) {
                    guardarNoticiaTxt(resultado.publishedAt);


                    noticia = await mensagemEmbed(resultado);
                    await enviarNoticiaAutomatica(channel, noticia);
                } else {
                    return;
                }
            })();
        });
        
    } catch (error) {
        console.error('Ocorreu um erro ao tentar enviar a notícia automatica: ', error);
    }
}




function limparMensagens(message, num) {

    const user = message.author;

    if (!message.member.hasPermission('KICK_MEMBERS')) {
        mensagemErro(message, "Não possuis permissões suficientes para executar este comando!");
        return;
    }

    if(num < 0 > num || num > 100) {
        num = 1;
    }

    if (message.channel.type == 'text') {
        async function clear() {
            message.delete();
            const fetched = await message.channel.messages.fetch({limit: num + 1});
            message.channel.bulkDelete(fetched);
        }
        clear();
        message.channel.send(`${user} foram excluidas ${num} mensagens!` );
    }               
}




// FUNÇÕES SECUNDARIAS (IMPORTANTES)
function enviarNoticiaAutomatica(channel, noticia) {
    let data = new Date();

        channel.send(noticia);  
        console.log(`Uma noticia foi enviada < ${data.getHours()}:${data.getMinutes()}:${data.getSeconds()} >`); 
}

function enviarNoticiaDelay(ms, message, noticia) {

    setTimeout(() => {
        message.channel.send(noticia);
    }, ms);
}


// FICHEIROS
function guardarNoticiaTxt(data) {
    // Irá guardar a hora e data da ultima notícia enviada em 'ultima_noticia.txt'.
    fs.writeFile('files/ultima_noticia.txt', data, (err) => { 
        if (err) throw err; 
    }) 
}

function lerTxt(diretorio, nome_txt) {
    let conteudo;
    conteudo = fs.readFileSync(diretorio + nome_txt,'utf8');

    return conteudo;
}


// FUNÇÕES SECUNDARIAS (MENSAGENS)
function mensagemEmbed(resultado) {

    let hora = resultado.publishedAt.slice(11,16);

    const mensagem = new Discord.MessageEmbed() 
        .setColor('#32CD32')
        .setAuthor('Futbolada', 'https://i.imgur.com/xDUVbh9.png', 'https://github.com/popeyBigG')
        .setTitle("**" + resultado.title + "**")
        .setURL(resultado.url)
        .setDescription(resultado.description)
        .addFields(
            { name: 'Autor', value: resultado.source.name},
        )
        .setImage(resultado.urlToImage)
        .setFooter(`Publicado a: ${resultado.publishedAt.slice(0,10)} | ${hora}`, '');
 
    return mensagem;
}

function mensagemComandos(message) {
    const ajuda = new Discord.MessageEmbed() 
        .setColor('#00fdf3')
        .setAuthor('Futbolada', 'https://i.imgur.com/xDUVbh9.png', 'https://github.com/popeyBigG')
        .setTitle("🔰 Comandos 🔰")
        .addFields(
            { name: '.pr', value: '`Comando mágico`' },
            { name: '.prputo', value: '`Comando mágico`' },
            { name: '.prgaranhao', value: '`Comando mágico`' },
            { name: '.zepr', value: '`Comando mágico`' },
            { name: '.vamoparar', value: '`Comando mágico`' },
            { name: '.fut', value: '`Apaga as notícias anteriores e mostra outras novas atualizadas `', inline: false },
            { name: '.fut (1 - 20)', value: '`Mostra o número de nóticias conforme o número colocado no parametro do mais recente (1...) ao mais antigo (... 20) sem apagar as anteriores`', inline: false},
            { name: 'Easter eggs', value: '`Palavras (não são comandos) em que o bot interage.`', inline: false },
        )
        .setImage("https://media.giphy.com/media/IdTUJAGPRDR7en4z9B/giphy.gif")
 
    message.channel.send(ajuda);
}

function mensagemErro(message, exemplo) {
    const aviso = new Discord.MessageEmbed() 
        .setColor('#ff0000')
        .setAuthor('Futbolada', 'https://i.imgur.com/xDUVbh9.png', 'https://github.com/popeyBigG')
        .setTitle("❌ Ocorreu um erro ❌")
        .setDescription("**Uso incorreto do comando!** " + exemplo)
 
    message.channel.send(aviso);
}

client.login(config.BOT_TOKEN);                         // Efetua o login do discord bot com o token setado no ficheiro config.json 
console.log("O bot foi iniciado! Programa sendo executado pelo PID " + process.ppid);