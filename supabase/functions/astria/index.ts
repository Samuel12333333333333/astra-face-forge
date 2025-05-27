import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// Improved CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Astria API key and base URL
const ASTRIA_API_KEY = Deno.env.get('ASTRIA_API_KEY')!;
// Base Flux model ID from Astria
const FLUX_BASE_MODEL_ID = 1504944; // Flux1.dev

serve(async (req) => {
  // CORS preflight - critical for browser requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request");
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    // Validate API key exists
    if (!ASTRIA_API_KEY) {
      console.error('ASTRIA_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log("No Authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Authentication error:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid token", details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    console.log("User ID:", userId);
    
    // Parse the request body to get the action
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request action:", requestBody.action);
    } catch (e) {
      console.error("Failed to parse request body:", e);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const action = requestBody.action;
    
    // Route requests based on action
    switch(action) {
      case 'upload-images':
        return await handleImageUpload(requestBody, corsHeaders, userId);
      case 'create-tune':
        return await createTune(requestBody, userId, corsHeaders);
      case 'generate-headshots':
        return await generateHeadshots(requestBody, userId, corsHeaders);
      case 'check-status':
        return await checkTuneStatus(requestBody, corsHeaders);
      default:
        console.error("Invalid action requested:", action);
        return new Response(
          JSON.stringify({ error: "Invalid action", action }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleImageUpload(requestData, corsHeaders, userId) {
  try {
    console.log("Processing image upload");
    
    // Check if we have the required data
    if (!requestData || !requestData.image) {
      console.error("No image data in request");
      return new Response(
        JSON.stringify({ error: "No image data provided" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if we have a tuneId for the API endpoint
    if (!requestData.tuneId) {
      console.error("No tuneId provided for image upload");
      return new Response(
        JSON.stringify({ error: "tuneId is required for image upload" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { image: base64Data, filename, contentType, tuneId } = requestData;
    
    // Validate the base64 data - accept both data:image and raw base64
    if (!base64Data || typeof base64Data !== 'string') {
      console.error("Invalid image data format");
      return new Response(
        JSON.stringify({ error: "Invalid image data format" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Received image data for: ${filename || 'unnamed file'}`);
    
    let imageBlob;
    try {
      // Handle both data:image/... format and raw base64
      if (base64Data.startsWith('data:')) {
        const base64Response = await fetch(base64Data);
        imageBlob = await base64Response.blob();
      } else {
        // Raw base64 - decode and create blob
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        imageBlob = new Blob([bytes], { type: contentType || 'image/jpeg' });
      }
    } catch (error) {
      console.error("Error processing base64 data:", error);
      return new Response(
        JSON.stringify({ error: "Failed to process image data", details: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!imageBlob || imageBlob.size === 0) {
      console.error("Empty image blob after conversion");
      return new Response(
        JSON.stringify({ error: "Image data conversion failed" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Converted to blob: ${contentType || imageBlob.type}, size: ${imageBlob.size} bytes`);
    
    // Create FormData for Astria API
    const formData = new FormData();
    const actualFileName = filename || `user_upload_${Date.now()}.${(contentType || 'image/jpeg').split('/')[1] || 'jpg'}`;
    const imageFile = new File([imageBlob], actualFileName, { type: contentType || imageBlob.type || 'image/jpeg' });
    formData.append('image', imageFile);
    
    // Send to Astria API with explicit timeout handling
    console.log(`Sending to Astria API: https://api.astria.ai/tunes/${tuneId}/images`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(`https://api.astria.ai/tunes/${tuneId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ASTRIA_API_KEY}`
        },
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log(`Astria API response status: ${response.status}`);
      
      // Get the response text first for better error logging
      let responseText = "";
      try {
        responseText = await response.text();
        console.log("Astria API response body:", responseText);
      } catch (e) {
        console.error("Could not read response text:", e);
      }
      
      let result;
      try {
        result = JSON.parse(responseText);
        console.log("Astria API response:", JSON.stringify(result));
      } catch (e) {
        console.error("Failed to parse JSON response:", e);
        return new Response(
          JSON.stringify({ error: "Failed to parse API response", raw: responseText.substring(0, 500) }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Check if the API returned an error response in a 200 OK wrapper
      if (result.status === 404 || result.error) {
        console.error("Astria API error in 200 response:", result);
        return new Response(
          JSON.stringify({ 
            error: "Astria API error", 
            status: result.status || 500,
            details: result.error || "Unknown error" 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!result.id) {
        return new Response(
          JSON.stringify({ error: "No image ID returned from Astria API", response: result }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (fetchError) {
      console.error("Fetch error with Astria API:", fetchError);
      
      if (fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: "Request to Astria API timed out" }),
          { status: 408, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `Fetch error: ${fetchError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Image upload error:', error);
    return new Response(
      JSON.stringify({ error: `Image upload failed: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function createTune(requestBody, userId, corsHeaders) {
  try {
    console.log("Processing create tune request for user:", userId);
    
    // Create tune with Astria API - without images first
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 1-minute timeout
    
    try {
      // Correct endpoint for Flux API
      const formData = new FormData();
      formData.append('tune[title]', `headshot_user_${userId.substring(0, 8)}`);
      formData.append('tune[base_tune_id]', FLUX_BASE_MODEL_ID.toString()); // Flux1.dev base model
      formData.append('tune[model_type]', 'lora');
      formData.append('tune[name]', 'person');
      formData.append('tune[preset]', 'flux-lora-portrait');
      formData.append('tune[instance_prompt]', `photo of sks${userId.substring(0, 8)} person`);
      formData.append('tune[class_prompt]', 'person');
      
      const response = await fetch(`https://api.astria.ai/tunes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ASTRIA_API_KEY}`
        },
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log(`Astria tune creation response status: ${response.status}`);
      
      // Get the response text first for better error logging
      let responseText = "";
      try {
        responseText = await response.text();
        console.log("Astria tune creation response body:", responseText);
      } catch (e) {
        console.error("Could not read response text:", e);
      }
      
      if (!response.ok) {
        console.error("Astria tune creation error:", response.status, responseText);
        
        return new Response(
          JSON.stringify({ 
            error: "Astria tune creation failed", 
            status: response.status, 
            details: responseText.substring(0, 500) 
          }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      let result;
      try {
        result = JSON.parse(responseText);
        console.log("Astria create tune success:", JSON.stringify(result));
      } catch (e) {
        console.error("Failed to parse JSON response:", e);
        return new Response(
          JSON.stringify({ error: "Failed to parse API response", raw: responseText.substring(0, 500) }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!result.id) {
        return new Response(
          JSON.stringify({ error: "No tune ID returned from Astria API", response: result }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Store the tune ID in the database
      try {
        const { data: modelData, error: modelError } = await supabase
          .from('models')
          .insert({ 
            user_id: userId, 
            modelid: result.id,
            status: result.status || 'training',
            name: `Headshot Model - ${new Date().toLocaleDateString()}`,
            type: 'headshot'
          })
          .select();
        
        if (modelError) {
          console.error("Database error storing model:", modelError);
        } else if (modelData && modelData.length > 0) {
          console.log("Stored model in database with ID:", modelData[0].id);
        }
      } catch (dbError) {
        console.error("Error storing model in database:", dbError);
      }
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("Fetch error with Astria tune creation:", fetchError);
      
      if (fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: "Tune creation request to Astria API timed out" }),
          { status: 408, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `Tune creation fetch error: ${fetchError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Create tune error:', error);
    return new Response(
      JSON.stringify({ error: `Tune creation failed: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function checkTuneStatus(requestBody, corsHeaders) {
  try {
    console.log("Checking tune status");
    
    const { tuneId } = requestBody;
    
    if (!tuneId) {
      console.error("No tuneId provided");
      return new Response(
        JSON.stringify({ error: "Tune ID is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Checking status for tune ID:", tuneId);
    
    // Check status with Astria API - correct endpoint
    const response = await fetch(`https://api.astria.ai/tunes/${tuneId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ASTRIA_API_KEY}`,
      }
    });
    
    console.log(`Astria status check response status: ${response.status}`);
    
    // Get the response text first for better error logging
    let responseText = "";
    try {
      responseText = await response.text();
      console.log("Astria status check response body:", responseText);
    } catch (e) {
      console.error("Could not read response text:", e);
    }
    
    if (!response.ok) {
      console.error("Astria status check error:", response.status, responseText);
      
      return new Response(
        JSON.stringify({ 
          error: "Astria status check failed", 
          status: response.status, 
          details: responseText.substring(0, 500) 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let result;
    try {
      result = JSON.parse(responseText);
      console.log("Astria tune status response:", JSON.stringify(result));
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      return new Response(
        JSON.stringify({ error: "Failed to parse API response", raw: responseText.substring(0, 500) }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Update status in database if possible
    try {
      if (result.id && result.status) {
        // Find the model with this tune ID
        const { data: models, error: findError } = await supabase
          .from('models')
          .select('id')
          .eq('modelId', tuneId)
          .limit(1);
        
        if (findError) {
          console.error("Error finding model:", findError);
        } else if (models && models.length > 0) {
          const { error: updateError } = await supabase
            .from('models')
            .update({ status: result.status })
            .eq('id', models[0].id);
          
          if (updateError) {
            console.error("Database error updating model status:", updateError);
          } else {
            console.log("Updated model status to:", result.status);
          }
        } else {
          console.log("No model found with tune ID:", tuneId);
        }
      }
    } catch (dbError) {
      console.error("Error updating model status in database:", dbError);
    }
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Check tune status error:', error);
    return new Response(
      JSON.stringify({ error: `Status check failed: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function generateHeadshots(requestBody, userId, corsHeaders) {
  try {
    console.log("Processing generate headshots request for user:", userId);
    console.log("Request body:", JSON.stringify(requestBody));
    
    const { prompt, numImages = 4, styleType, tuneId } = requestBody;
    
    if (!prompt) {
      console.error("No prompt provided");
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!tuneId) {
      console.error("No tuneId provided");
      return new Response(
        JSON.stringify({ error: "Tune ID is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Using tune ID for generation:", tuneId);
    
    // Create the prompt with style-specific additions
    let promptText = prompt;
    
    // Add style-specific modifiers
    if (styleType === 'professional') {
      promptText = `${prompt}, professional studio lighting, neutral background, business attire, DSLR, high resolution`;
    } else if (styleType === 'casual') {
      promptText = `${prompt}, natural lighting, casual attire, modern setting, Canon 5D, crisp focus`;
    } else if (styleType === 'creative') {
      promptText = `${prompt}, artistic lighting, creative setting, high contrast, professional photography`;
    }
    
    console.log("Generating with prompt:", promptText);
    
    // Generate headshots with Astria API - with timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2-minute timeout for generation
    
    try {
      // Use FormData for the request
      const formData = new FormData();
      formData.append('prompt[text]', promptText);
      formData.append('prompt[num_images]', String(numImages || 4));
      
      // Call the correct endpoint with the tuneId
      const response = await fetch(`https://api.astria.ai/tunes/${tuneId}/prompts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ASTRIA_API_KEY}`
        },
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log(`Astria generation response status: ${response.status}`);
      
      // Get the response text first for better error logging
      let responseText = "";
      try {
        responseText = await response.text();
        console.log("Astria generation response body:", responseText.substring(0, 500));
      } catch (e) {
        console.error("Could not read response text:", e);
      }
      
      if (!response.ok) {
        console.error("Astria generation error:", response.status, responseText);
        
        return new Response(
          JSON.stringify({ 
            error: "Astria generation failed", 
            status: response.status, 
            details: responseText.substring(0, 500) 
          }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      let result;
      try {
        result = JSON.parse(responseText);
        console.log("Astria generation success, received result:", JSON.stringify(result).substring(0, 300) + "...");
      } catch (e) {
        console.error("Failed to parse JSON response:", e);
        return new Response(
          JSON.stringify({ error: "Failed to parse API response", raw: responseText.substring(0, 500) }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Check if we have images in the response - handle variation in API response format
      const images = [];
      
      if (result.output && result.output.images && Array.isArray(result.output.images)) {
        // Handle images in the output.images array
        images.push(...result.output.images.map(img => img.url || img));
      } else if (result.images && Array.isArray(result.images)) {
        // Handle direct images array
        images.push(...result.images);
      }
      
      if (images.length === 0) {
        console.error("No images in response:", JSON.stringify(result).substring(0, 500));
        return new Response(
          JSON.stringify({ error: "No images returned from Astria API", response: result }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Find the model record for this tune ID
      const { data: models, error: findError } = await supabase
        .from('models')
        .select('id')
        .eq('modelId', tuneId)
        .limit(1);
      
      if (findError || !models || models.length === 0) {
        console.error("Error finding model:", findError || "Model not found");
      } else {
        // Store generated images in the database
        try {
          const modelId = models[0].id;
          const headshotsToInsert = images.map((imageUrl) => ({
            modelId: modelId,
            uri: imageUrl,
          }));
          
          const { error: dbError } = await supabase
            .from('images')
            .insert(headshotsToInsert);
          
          if (dbError) {
            console.error("Database error storing headshots:", dbError);
          } else {
            console.log(`Successfully stored ${headshotsToInsert.length} headshots in database`);
          }
        } catch (dbError) {
          console.error("Error storing headshots in database:", dbError);
        }
      }
      
      // Format the response to include the image URLs
      const normalizedResult = {
        id: result.id,
        images: images
      };
      
      return new Response(
        JSON.stringify(normalizedResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("Fetch error with Astria generation:", fetchError);
      
      if (fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: "Headshot generation request to Astria API timed out" }),
          { status: 408, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `Generation fetch error: ${fetchError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Generate headshots error:', error);
    return new Response(
      JSON.stringify({ error: `Headshot generation failed: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
