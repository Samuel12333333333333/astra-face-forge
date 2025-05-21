
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Astria API key and base URL
const ASTRIA_API_KEY = Deno.env.get('ASTRIA_API_KEY')!;
const ASTRIA_API_BASE_URL = 'https://api.astria.ai';

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token", details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    console.log("User ID:", userId);
    
    // Parse the request body to get the action
    const requestBody = await req.json();
    const action = requestBody.action;
    
    console.log("Processing action:", action);
    
    // Route requests based on action
    switch(action) {
      case 'upload-images':
        return await handleImageUpload(requestBody);
      case 'create-tune':
        return await createTune(requestBody, userId);
      case 'generate-headshots':
        return await generateHeadshots(requestBody, userId);
      case 'check-status':
        return await checkTuneStatus(requestBody);
      default:
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

async function handleImageUpload(requestData) {
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
    
    const { image: base64Data, filename, contentType } = requestData;
    
    // Validate the base64 data
    if (!base64Data || typeof base64Data !== 'string' || !base64Data.includes('base64')) {
      console.error("Invalid image data format");
      return new Response(
        JSON.stringify({ error: "Invalid image data format" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Received base64 image data of length: ${base64Data.length}`);
    
    // Convert base64 to blob
    const base64Response = await fetch(base64Data);
    const imageBlob = await base64Response.blob();
    
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
    
    // Try both potential API endpoints
    let response;
    let endpointTried = '';
    
    try {
      // First try with /v1/images (most likely based on documentation)
      endpointTried = `${ASTRIA_API_BASE_URL}/v1/images`;
      console.log(`Trying image upload to endpoint: ${endpointTried}`);
      
      response = await fetch(endpointTried, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ASTRIA_API_KEY}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }
    } catch (error) {
      console.warn(`Failed with endpoint ${endpointTried}: ${error.message}`);
      
      // Fallback to /api/v1/images
      endpointTried = `${ASTRIA_API_BASE_URL}/api/v1/images`;
      console.log(`Retrying with alternative endpoint: ${endpointTried}`);
      
      response = await fetch(endpointTried, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ASTRIA_API_KEY}`
        },
        body: formData
      });
    }
    
    console.log(`Astria API response status: ${response.status} from endpoint: ${endpointTried}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Astria API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: "Astria API error", 
          status: response.status, 
          details: errorText.substring(0, 500) 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const result = await response.json();
    console.log("Astria API success response:", JSON.stringify(result));
    
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
  } catch (error) {
    console.error('Image upload error:', error);
    return new Response(
      JSON.stringify({ error: `Image upload failed: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function createTune(requestBody, userId) {
  try {
    console.log("Processing create tune request for user:", userId);
    
    const { imageIds, callbackUrl } = requestBody;
    
    if (!imageIds || !Array.isArray(imageIds) || imageIds.length < 10) {
      return new Response(
        JSON.stringify({ error: "At least 10 image IDs are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Creating tune with ${imageIds.length} images:`, imageIds);
    
    // Try both potential API endpoints
    let response;
    let endpointTried = '';
    
    try {
      // First try with /v1/tunes (most likely based on documentation)
      endpointTried = `${ASTRIA_API_BASE_URL}/v1/tunes`;
      console.log(`Trying tune creation at endpoint: ${endpointTried}`);
      
      response = await fetch(endpointTried, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ASTRIA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `headshot_user_${userId}`,
          instance_prompt: `photo of sks${userId} person`,
          class_prompt: "person",
          images: imageIds,
          callback_url: callbackUrl || null
        })
      });
      
      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }
    } catch (error) {
      console.warn(`Failed with endpoint ${endpointTried}: ${error.message}`);
      
      // Fallback to /api/v1/tunes
      endpointTried = `${ASTRIA_API_BASE_URL}/api/v1/tunes`;
      console.log(`Retrying with alternative endpoint: ${endpointTried}`);
      
      response = await fetch(endpointTried, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ASTRIA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `headshot_user_${userId}`,
          instance_prompt: `photo of sks${userId} person`,
          class_prompt: "person",
          images: imageIds,
          callback_url: callbackUrl || null
        })
      });
    }
    
    console.log(`Astria tune creation response status: ${response.status} from endpoint: ${endpointTried}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Astria tune creation error:", response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: "Astria tune creation failed", 
          status: response.status, 
          details: errorText.substring(0, 500) 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const result = await response.json();
    console.log("Astria create tune success:", JSON.stringify(result));
    
    if (!result.id) {
      return new Response(
        JSON.stringify({ error: "No tune ID returned from Astria API", response: result }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Store the tune ID in the database
    try {
      const { error: dbError } = await supabase
        .from('user_tunes')
        .upsert({ 
          user_id: userId, 
          tune_id: result.id,
          status: result.status || 'training',
          created_at: new Date().toISOString()
        });
      
      if (dbError) {
        console.error("Database error storing tune:", dbError);
      }
    } catch (dbError) {
      console.error("Error storing tune in database:", dbError);
    }
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Create tune error:', error);
    return new Response(
      JSON.stringify({ error: `Tune creation failed: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function checkTuneStatus(requestBody) {
  try {
    console.log("Checking tune status");
    
    const { tuneId } = requestBody;
    
    if (!tuneId) {
      return new Response(
        JSON.stringify({ error: "Tune ID is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Checking status for tune ID:", tuneId);
    
    // Try both potential API endpoints
    let response;
    let endpointTried = '';
    
    try {
      // First try with /v1/tunes/{tuneId} (most likely based on documentation)
      endpointTried = `${ASTRIA_API_BASE_URL}/v1/tunes/${tuneId}`;
      console.log(`Checking tune status at endpoint: ${endpointTried}`);
      
      response = await fetch(endpointTried, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ASTRIA_API_KEY}`,
        }
      });
      
      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }
    } catch (error) {
      console.warn(`Failed with endpoint ${endpointTried}: ${error.message}`);
      
      // Fallback to /api/v1/tunes/{tuneId}
      endpointTried = `${ASTRIA_API_BASE_URL}/api/v1/tunes/${tuneId}`;
      console.log(`Retrying with alternative endpoint: ${endpointTried}`);
      
      response = await fetch(endpointTried, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ASTRIA_API_KEY}`,
        }
      });
    }
    
    console.log(`Astria status check response status: ${response.status} from endpoint: ${endpointTried}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Astria status check error:", response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: "Astria status check failed", 
          status: response.status, 
          details: errorText.substring(0, 500) 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const result = await response.json();
    console.log("Astria tune status response:", JSON.stringify(result));
    
    // Update status in database if possible
    try {
      if (result.id && result.status) {
        const { error: dbError } = await supabase
          .from('user_tunes')
          .update({ status: result.status })
          .eq('tune_id', tuneId);
        
        if (dbError) {
          console.error("Database error updating tune status:", dbError);
        }
      }
    } catch (dbError) {
      console.error("Error updating tune status in database:", dbError);
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

async function generateHeadshots(requestBody, userId) {
  try {
    console.log("Processing generate headshots request for user:", userId);
    console.log("Request body:", JSON.stringify(requestBody));
    
    const { prompt, numImages, styleType, tuneId } = requestBody;
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!tuneId) {
      return new Response(
        JSON.stringify({ error: "Tune ID is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Using tune ID for generation:", tuneId);
    
    // Generate images using the tune
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
    
    // Try different endpoints for generating headshots
    let response;
    let endpointTried = '';
    
    // Array of possible endpoints to try
    const possibleEndpoints = [
      `/v1/tunes/${tuneId}/inference`,     // Standard inference endpoint
      `/api/v1/tunes/${tuneId}/inference`, // Alternative inference endpoint
      `/v1/tunes/${tuneId}/prompts`,       // Prompts-based endpoint (documented)
      `/api/v1/tunes/${tuneId}/prompts`    // Alternative prompts endpoint
    ];
    
    let successfulResponse = null;
    
    // Try each endpoint until one works
    for (const endpoint of possibleEndpoints) {
      endpointTried = `${ASTRIA_API_BASE_URL}${endpoint}`;
      console.log(`Trying generation at endpoint: ${endpointTried}`);
      
      try {
        response = await fetch(endpointTried, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ASTRIA_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: promptText,
            num_images: numImages || 4
          })
        });
        
        console.log(`${endpointTried} response status: ${response.status}`);
        
        if (response.ok) {
          successfulResponse = response;
          console.log(`Successfully used endpoint: ${endpointTried}`);
          break;
        }
      } catch (error) {
        console.warn(`Failed with endpoint ${endpointTried}: ${error.message}`);
      }
    }
    
    if (!successfulResponse) {
      return new Response(
        JSON.stringify({ 
          error: "All Astria generation endpoints failed", 
          lastEndpointTried: endpointTried
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const result = await successfulResponse.json();
    console.log("Astria generation success, received result");
    
    // Handle both potential response formats (images array or output.images array)
    if ((!result.images || !Array.isArray(result.images) || result.images.length === 0) &&
        (!result.output || !result.output.images || !Array.isArray(result.output.images) || result.output.images.length === 0)) {
      console.error("No images in response:", JSON.stringify(result).substring(0, 500));
      return new Response(
        JSON.stringify({ error: "No images returned from Astria API", response: result }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Normalize the response to have consistent format
    const normalizedResult = {
      id: result.id || `prompt-${Date.now()}`,
      images: result.images || result.output.images
    };
    
    // Store generated images in the database
    try {
      const headshotsToInsert = normalizedResult.images.map((image) => ({
        user_id: userId,
        image_url: image.url,
        prompt_id: normalizedResult.id,
        style_type: styleType || 'standard',
        created_at: new Date().toISOString()
      }));
      
      const { error: dbError } = await supabase
        .from('user_headshots')
        .insert(headshotsToInsert);
      
      if (dbError) {
        console.error("Database error storing headshots:", dbError);
      }
    } catch (dbError) {
      console.error("Error storing headshots in database:", dbError);
    }
    
    return new Response(
      JSON.stringify(normalizedResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Generate headshots error:', error);
    return new Response(
      JSON.stringify({ error: `Headshot generation failed: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
