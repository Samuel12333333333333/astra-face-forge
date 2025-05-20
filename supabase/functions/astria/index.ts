
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

// Astria API key
const ASTRIA_API_KEY = Deno.env.get('ASTRIA_API_KEY')!;

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
    
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const action = pathParts[pathParts.length - 1]; 
    
    console.log("Request path:", url.pathname);
    console.log("Action identified:", action);
    
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
    console.log("Processing action:", action);
    
    // Route requests based on action
    switch(action) {
      case 'upload-images':
        return await handleImageUpload(req, userId);
      case 'create-tune':
        return await createTune(req, userId);
      case 'generate-headshots':
        return await generateHeadshots(req, userId);
      case 'check-status':
        return await checkTuneStatus(req, userId);
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

async function handleImageUpload(req: Request, userId: string) {
  try {
    console.log("Processing image upload for user:", userId);
    
    // Get image data from request
    const imageBlob = await req.blob();
    const contentType = req.headers.get('Content-Type') || 'image/jpeg';
    
    if (!imageBlob || imageBlob.size === 0) {
      console.error("Empty image blob received");
      return new Response(
        JSON.stringify({ error: "No image provided or image is empty" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Received image: ${contentType}, size: ${imageBlob.size} bytes`);
    
    // Create FormData for Astria API
    const formData = new FormData();
    const fileName = `user_${userId}_${Date.now()}.${contentType.split('/')[1] || 'jpg'}`;
    const imageFile = new File([imageBlob], fileName, { type: contentType });
    formData.append('image', imageFile);
    
    // Send to Astria API
    console.log("Sending image to Astria API...");
    const response = await fetch('https://api.astria.ai/images/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ASTRIA_API_KEY}`
      },
      body: formData
    });
    
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
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Image upload error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function createTune(req: Request, userId: string) {
  try {
    console.log("Processing create tune request for user:", userId);
    const requestBody = await req.json();
    
    const { imageIds, callbackUrl } = requestBody;
    
    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "Image IDs are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create tune on Astria
    console.log(`Creating tune with ${imageIds.length} images`);
    const response = await fetch('https://api.astria.ai/tunes', {
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
      const errorText = await response.text();
      console.error("Astria tune creation error:", response.status, errorText);
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
    console.log("Astria create tune success:", JSON.stringify(result));
    
    // Store the tune ID in the database
    const { error: dbError } = await supabase
      .from('user_tunes')
      .upsert({ 
        user_id: userId, 
        tune_id: result.id,
        status: 'training',
        created_at: new Date().toISOString()
      });
    
    if (dbError) {
      console.error("Database error storing tune:", dbError);
    }
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Create tune error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function checkTuneStatus(req: Request, userId: string) {
  try {
    console.log("Checking tune status for user:", userId);
    let requestBody;
    
    try {
      requestBody = await req.json();
    } catch {
      requestBody = {};
    }
    
    const requestTuneId = requestBody.tuneId;
    
    // Get tune ID from the database for this user if not specified
    let tuneId = requestTuneId;
    if (!tuneId) {
      const { data, error } = await supabase
        .from('user_tunes')
        .select('tune_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error || !data) {
        console.error("Error finding tune:", error);
        return new Response(
          JSON.stringify({ error: "No tune found for this user" }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      tuneId = data.tune_id;
    }
    
    console.log("Checking status for tune ID:", tuneId);
    
    // Check status on Astria
    const response = await fetch(`https://api.astria.ai/tunes/${tuneId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ASTRIA_API_KEY}`,
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Astria status check error:", response.status, errorText);
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
    console.log("Astria tune status response:", JSON.stringify(result));
    
    // Update status in database if changed
    if (result.status) {
      const { data } = await supabase
        .from('user_tunes')
        .select('status')
        .eq('tune_id', tuneId)
        .single();
      
      if (data && data.status !== result.status) {
        await supabase
          .from('user_tunes')
          .update({ status: result.status })
          .eq('tune_id', tuneId);
      }
    }
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Check tune status error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function generateHeadshots(req: Request, userId: string) {
  try {
    console.log("Processing generate headshots request for user:", userId);
    const requestBody = await req.json();
    console.log("Request body:", JSON.stringify(requestBody));
    
    const { prompt, numImages, styleType, tuneId: requestTuneId } = requestBody;
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get tune ID from the request or database
    let tuneId = requestTuneId;
    if (!tuneId) {
      const { data, error } = await supabase
        .from('user_tunes')
        .select('tune_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error || !data) {
        console.error("Error finding tune:", error);
        return new Response(
          JSON.stringify({ error: "No tune found for this user" }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      tuneId = data.tune_id;
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
    
    const response = await fetch(`https://api.astria.ai/tunes/${tuneId}/prompts`, {
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
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Astria generation error:", response.status, errorText);
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
    console.log("Astria generation success, response length:", JSON.stringify(result).length);
    
    // Store generated images in the database
    if (result.images && Array.isArray(result.images)) {
      const headshotsToInsert = result.images.map((image: any) => ({
        user_id: userId,
        image_url: image.url,
        prompt_id: result.id,
        style_type: styleType || 'standard',
        created_at: new Date().toISOString()
      }));
      
      const { error: dbError } = await supabase
        .from('user_headshots')
        .insert(headshotsToInsert);
      
      if (dbError) {
        console.error("Database error storing headshots:", dbError);
      }
    }
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Generate headshots error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
