import fastify from 'fastify';

const server = () => {
  const app = fastify();

  const taskSchema = {
    type: 'object',
    required: ['task', 'deadline'],
    properties: {
      task: { type: 'string', pattern: '^[A-ZА-ЯЁ]' },
      deadline: {
        type: 'string',
        pattern: '^\\d{2}\\.\\d{2}\\.\\d{4} \\d{2}:\\d{2}$',
      },
    },
    additionalProperties: false,
  };

  app.post('/tasks', {
    schema: {
      body: taskSchema,
    },
  }, (req, reply) => {
    const { task, deadline } = req.body;

    reply
      .header('Content-Type', 'application/json; charset=utf-8')
      .send({ message: 'Task has been added successfully', task, deadline });
  });

  return app;
};

const port = 3000;

server().listen({ port }, (err, address) => {
  if (err) {
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
