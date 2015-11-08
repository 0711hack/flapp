package com.mysampleapp.demo;

import android.app.AlertDialog;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import com.amazonaws.mobile.AWSMobileClient;
import com.amazonaws.mobile.user.IdentityManager;
import com.mysampleapp.R;

 public class KnockList extends DemoFragmentBase {
    /** Logging tag for this class. */
    private static final String LOG_TAG = KnockList.class.getSimpleName();



    /** This fragment's view. */
    private View mFragmentView;

    /** Text view for showing the user identity. */
    private TextView userIdTextView;

    /** Text view for showing the user name. */
    private TextView userNameTextView;

    /** Image view for showing the user image. */
    private ImageView userImageView;

    @Override
    public View onCreateView(final LayoutInflater inflater, final ViewGroup container,
                             final Bundle savedInstanceState) {
        // Inflate the layout for this fragment

        // Obtain a reference to the identity manager.

        return mFragmentView;
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
    }



}
