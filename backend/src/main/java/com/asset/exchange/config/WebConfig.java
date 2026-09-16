package com.asset.exchange.config;

import com.asset.exchange.security.AuthInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private AuthInterceptor authInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // We protect the asset modification routes and POST /api/assets (create asset)
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/assets/*/exchange")
                .addPathPatterns("/api/assets/*/recycle")
                .addPathPatterns("/api/assets") // POST create asset
                // We exclude GET requests from auth, though we can't easily differentiate methods in addPathPatterns here.
                // We will handle it by excluding GET explicitly if needed, but the requirements just need POST protected.
                // Actually, since GET /api/assets is public, protecting "/api/assets" indiscriminately would block GET.
                // Let's protect specific POST paths. Since we can't filter by HTTP method in InterceptorRegistry easily, 
                // we'll update the interceptor or just protect the action routes for now.
                // Better approach: Exclude GET in the Interceptor itself.
                .addPathPatterns("/api/assets/**"); // Protect everything under /api/assets
    }
}
