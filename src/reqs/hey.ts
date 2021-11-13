module.exports = {
  slug: "", //set it to nothing for "/"
  type: "get",
  async execute(request: any, reply: any) {
    reply.send({ message: "you found us ;)" });
  },
};
