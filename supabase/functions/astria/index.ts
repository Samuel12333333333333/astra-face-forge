
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user ID from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    
    // Process based on action
    if (action === 'upload-images') {
      return await handleImageUpload(req, userId);
    } else if (action === 'create-tune') {
      return await createTune(req, userId);
    } else if (action === 'generate-headshots') {
      return await generateHeadshots(req, userId);
    } else if (action === 'check-status') {
      return await checkTuneStatus(req, userId);
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
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
    const formData = await req.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Build FormData for Astria API
    const astriaFormData = new FormData();
    astriaFormData.append('image', image);
    
    // Send to Astria
    const response = await fetch('https://api.astria.ai/images/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ASTRIA_API_KEY}`
      },
      body: astriaFormData
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`Astria API error: ${result.error || response.statusText}`);
    }
    
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
    const { imageIds, callbackUrl } = await req.json();
    
    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "Image IDs are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create tune on Astria
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
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`Astria API error: ${result.error || response.statusText}`);
    }
    
    // Store the tune ID in the database for this user
    await supabase
      .from('user_tunes')
      .upsert({ 
        user_id: userId, 
        tune_id: result.id,
        status: 'training',
        created_at: new Date().toISOString()
      });
    
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
    // Get tune ID from the database for this user
    const { data: userTune, error: tuneError } = await supabase
      .from('user_tunes')
      .select('tune_id, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (tuneError || !userTune) {
      return new Response(
        JSON.stringify({ error: "No tune found for this user" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check status on Astria
    const response = await fetch(`https://api.astria.ai/tunes/${userTune.tune_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ASTRIA_API_KEY}`,
      }
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`Astria API error: ${result.error || response.statusText}`);
    }
    
    // Update status in database if it has changed
    if (result.status && result.status !== userTune.status) {
      await supabase
        .from('user_tunes')
        .update({ status: result.status })
        .eq('tune_id', userTune.tune_id);
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
    const { prompt, numImages, styleType } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get tune ID from the database for this user
    const { data: userTune, error: tuneError } = await supabase
      .from('user_tunes')
      .select('tune_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (tuneError || !userTune) {
      return new Response(
        JSON.stringify({ error: "No tune found for this user" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
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
    
    const response = await fetch(`https://api.astria.ai/tunes/${userTune.tune_id}/prompts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ASTRIA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: promptText,
        num_images: numImages || 6
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`Astria API error: ${result.error || response.statusText}`);
    }
    
    // Store generated images in the database
    if (result.images && Array.isArray(result.images)) {
      const headshotsToInsert = result.images.map((image: any) => ({
        user_id: userId,
        image_url: image.url,
        prompt_id: result.id,
        style_type: styleType || 'standard',
        created_at: new Date().toISOString()
      }));
      
      await supabase.from('user_headshots').insert(headshotsToInsert);
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
