/*
 * Copyright 2010-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

package com.flapp;

import com.amazonaws.mobileconnectors.apigateway.annotation.Operation;
import com.amazonaws.mobileconnectors.apigateway.annotation.Parameter;
import com.amazonaws.mobileconnectors.apigateway.annotation.Service;

import java.util.*;

@Service(endpoint = "https://1rzcudhqjl.execute-api.eu-west-1.amazonaws.com/dev")
public interface FlappClient {
    
    /**
     * 
     * 
     * @param body 
     * @return Empty
     */
    @Operation(path = "/flap", method = "POST")
    Empty flapPost(
            Empty body);
    
    /**
     * 
     * 
     * @param flapid 
     * @return Empty
     */
    @Operation(path = "/flap/{flapid}/image", method = "GET")
    Empty flapFlapidImageGet(
            @Parameter(name = "flapid", location = "path")
            String flapid);
    
    /**
     * 
     * 
     * @param flapid 
     * @return Empty
     */
    @Operation(path = "/flap/{flapid}/image", method = "POST")
    Empty flapFlapidImagePost(
            @Parameter(name = "flapid", location = "path")
            String flapid);
    
    /**
     * 
     * 
     * @param flapid 
     * @param imageid 
     * @return Empty
     */
    @Operation(path = "/flap/{flapid}/image/{imageid}", method = "GET")
    Empty flapFlapidImageImageidGet(
            @Parameter(name = "flapid", location = "path")
            String flapid,
            @Parameter(name = "imageid", location = "path")
            String imageid);
    
    /**
     * 
     * 
     * @param flapid 
     * @return Empty
     */
    @Operation(path = "/flap/{flapid}/knock", method = "GET")
    Empty flapFlapidKnockGet(
            @Parameter(name = "flapid", location = "path")
            String flapid);
    
    /**
     * 
     * 
     * @param flapid 
     * @param body 
     * @return Empty
     */
    @Operation(path = "/flap/{flapid}/knock", method = "POST")
    Empty flapFlapidKnockPost(
            @Parameter(name = "flapid", location = "path")
            String flapid,
            Empty body);
    
    /**
     * 
     * 
     * @param flapid 
     * @param knockid 
     * @return Empty
     */
    @Operation(path = "/flap/{flapid}/knock/{knockid}", method = "GET")
    Empty flapFlapidKnockKnockidGet(
            @Parameter(name = "flapid", location = "path")
            String flapid,
            @Parameter(name = "knockid", location = "path")
            String knockid);
    
    /**
     * 
     * 
     * @param flapid 
     * @param knockid 
     * @return Empty
     */
    @Operation(path = "/flap/{flapid}/knock/{knockid}", method = "PUT")
    Empty flapFlapidKnockKnockidPut(
            @Parameter(name = "flapid", location = "path")
            String flapid,
            @Parameter(name = "knockid", location = "path")
            String knockid);
    
    /**
     * 
     * 
     * @param flapid 
     * @param knockid 
     * @return Empty
     */
    @Operation(path = "/flap/{flapid}/knock/{knockid}", method = "DELETE")
    Empty flapFlapidKnockKnockidDelete(
            @Parameter(name = "flapid", location = "path")
            String flapid,
            @Parameter(name = "knockid", location = "path")
            String knockid);
    
}
