const routes = async (app) => {
  app.get('/', async () => {
    return { hello: 'world' }
  })
}

export default routes
