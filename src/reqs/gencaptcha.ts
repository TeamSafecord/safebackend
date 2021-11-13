import { createCanvas } from "canvas";
import { Captcha } from "captcha-canvas";
module.exports = {
  slug: "gen/captcha",
  type: "post",
  async execute(request: any, reply: any) {
    // temp for response
    let finalResponse = {
      status: "error",
      data: {
        captcha: "",
        captchaImg: Buffer.from("a"),
      },
    };

    // Find out the difficulty level
    let requestOptions = {
      difficulty: 6,
    };
    requestOptions = request.body;

    // generate a random captcha function
    async function captchaGen(difficulty: number) {
      let captcha = "";
      let chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let length = 6;
      if (difficulty) {
        length = difficulty;
      }
      let charsLength = chars.length;
      for (let i = 0; i < length; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * charsLength));
      }
      return captcha;
    }

    // generate a random captcha
    let captcha = await captchaGen(requestOptions.difficulty);

    // apply changes to the response

    finalResponse.data.captcha = captcha;
    finalResponse.status = "success";

    // render an image with text
    async function renderImage(text: string) {
      const captcha = new Captcha(); //create a captcha canvas of 100x300.
      captcha.async = false; //Sync
      captcha.addDecoy(); //Add decoy text on captcha canvas.
      captcha.drawTrace(); //draw trace lines on captcha canvas.
      captcha.drawCaptcha(); //draw captcha text on captcha canvas.
      return captcha.png;
    }

    finalResponse.data.captchaImg = await renderImage(captcha);

    // send the response

    reply.send(finalResponse);
  },
};
