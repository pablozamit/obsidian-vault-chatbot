export default async function handler(req, res) {
  // Configurar CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Obtener el path de la API
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path || '';
  
  // URL del backend de Encore
  const backendUrl = `https://obsidian-vault-chatbot-nk6i.encr.app/${apiPath}`;

  try {
    // Preparar headers
    const headers = {
      'Content-Type': 'application/json',
    };

    // Preparar opciones para fetch
    const fetchOptions = {
      method: req.method,
      headers: headers,
    };

    // Agregar body si no es GET
    if (req.method !== 'GET' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    // Hacer la petición al backend
    const response = await fetch(backendUrl, fetchOptions);
    
    // Obtener la respuesta
    const data = await response.text();
    
    // Devolver la respuesta con el mismo status code
    res.status(response.status);
    
    // Si la respuesta es JSON, parsearlo y devolverlo
    try {
      const jsonData = JSON.parse(data);
      return res.json(jsonData);
    } catch {
      // Si no es JSON, devolver como texto
      return res.send(data);
    }
    
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Proxy error', 
      details: error.message 
    });
  }
}
