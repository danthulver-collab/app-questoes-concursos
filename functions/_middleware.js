export async function onRequest(context) {
  try {
    return await context.next();
  } catch (err) {
    // Se der 404, retorna index.html
    return new Response(null, {
      status: 302,
      headers: { Location: '/' }
    });
  }
}
