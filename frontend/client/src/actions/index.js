'use strict';

export const login_ing = () => ({
    type: 'LOGIN_ING'
})

export const login_done = (response) => ({
    type: 'LOGIN_DONE',
    response: response
})

export const login_err = (err) => ({
    type: 'LOGIN_ERR',
    err: err
})

export const logout = () => ({
    type: 'LOGOUT'
})

// admin
export const get_users_ing = () => ({
    type: 'GET_USERS_ING'
})

export const get_users_done = (response) => ({
    type: 'GET_USERS_DONE',
    response: response
})

export const get_users_err = (err) => ({
    type: 'GET_USERS_ERR',
    err: err
})

export const local_update_user = (email, user) => ({
    type: 'LOCAL_UPDATE_USER',
    email: email,
    user: user
})

export const update_user_ing = () => ({
    type: 'UPDATE_USER_ING'
})

export const update_user_done = (response) => ({
    type: 'UPDATE_USER_DONE',
    response: response
})

export const update_user_err = (err) => ({
    type: 'UPDATE_USER_ERR',
    err: err
})

export const delete_user_ing = () => ({
    type: 'DELETE_USER_ING'
})

export const delete_user_done = (response) => ({
    type: 'DELETE_USER_DONE',
    response: response
})

export const delete_user_err = (err) => ({
    type: 'DELETE_USER_ERR',
    err: err
})

export const add_user_ing = () => ({
    type: 'ADD_USER_ING'
})

export const add_user_done = (response) => ({
    type: 'ADD_USER_DONE',
    response: response
})

export const add_user_err = (err) => ({
    type: 'ADD_USER_ERR',
    err: err
})

// recognize
export const reset_files = () => ({
    type: 'RESET_FILES'
})

export const drop_files = (files) => ({
    type: 'DROP_FILES',
    files: files
})

export const upload_files_ing = () => ({
    type: 'UPLOAD_FILES_ING'
})

export const upload_files_done = () => ({
    type: 'UPLOAD_FILES_DONE'
})

export const upload_analysis_ing = () => ({
    type: 'UPLOAD_ANALYSIS_ING'
})

export const upload_analysis_done = (data, api_dur) => ({
    type: 'UPLOAD_ANALYSIS_DONE',
    data: data,
    api_dur: api_dur
})

export const upload_files_err = (err) => ({
    type: 'UPLOAD_FILES_ERR',
    err: err
})

// socket
export const update_socket = (socket_pack) => ({
    type: 'UPDATE_SOCKET',
    socket_pack: socket_pack
})

// formula ocr
export const fo_reset_files = () => ({
    type: 'FO_RESET_FILES'
})

export const fo_drop_files = (files) => ({
    type: 'FO_DROP_FILES',
    files: files
})

export const fo_upload_files_ing = () => ({
    type: 'FO_UPLOAD_FILES_ING'
})

export const fo_upload_files_done = () => ({
    type: 'FO_UPLOAD_FILES_DONE'
})

export const fo_upload_analysis_ing = () => ({
    type: 'FO_UPLOAD_ANALYSIS_ING'
})

export const fo_upload_analysis_done = (data, api_dur) => ({
    type: 'FO_UPLOAD_ANALYSIS_DONE',
    data: data,
    api_dur: api_dur
})

export const fo_upload_files_err = (err) => ({
    type: 'FO_UPLOAD_FILES_ERR',
    err: err
})

// socket
export const fo_update_socket = (socket_pack) => ({
    type: 'FO_UPDATE_SOCKET',
    socket_pack: socket_pack
})

// autosolve
export const au_reset_files = () => ({
    type: 'AU_RESET_FILES'
})

export const au_drop_files = (files) => ({
    type: 'AU_DROP_FILES',
    files: files
})

export const au_upload_files_ing = () => ({
    type: 'AU_UPLOAD_FILES_ING'
})

export const au_upload_files_done = () => ({
    type: 'AU_UPLOAD_FILES_DONE'
})

export const au_upload_analysis_ing = () => ({
    type: 'AU_UPLOAD_ANALYSIS_ING'
})

export const au_upload_analysis_done = (data, api_dur) => ({
    type: 'AU_UPLOAD_ANALYSIS_DONE',
    data: data,
    api_dur: api_dur
})

export const au_upload_files_err = (err) => ({
    type: 'AU_UPLOAD_FILES_ERR',
    err: err
})

export const au_update_type = (question_type) => ({
    type: 'AU_UPDATE_TYPE',
    question_type: question_type
})

// socket
export const au_update_socket = (socket_pack) => ({
    type: 'AU_UPDATE_SOCKET',
    socket_pack: socket_pack
})

// nnin
export const upload_question_ing = (question) => ({
    type: 'UPLOAD_QUESTION_ING',
    question: question
})

export const upload_question_done = (data) => ({
    type: 'UPLOAD_QUESTION_DONE',
    data: data
})

export const upload_question_err = (err) => ({
    type: 'UPLOAD_QUESTION_ERR',
    err: err
})

export const reset_question = () => ({
    type: 'RESET_QUESTION'
})

// knowledge tagging jixin
export const ktjx_reset_files = () => ({
    type: 'KTJX_RESET_FILES'
})

export const ktjx_drop_files = (files) => ({
    type: 'KTJX_DROP_FILES',
    files: files
})

export const ktjx_upload_files_ing = () => ({
    type: 'KTJX_UPLOAD_FILES_ING'
})

export const ktjx_upload_files_done = () => ({
    type: 'KTJX_UPLOAD_FILES_DONE'
})

export const ktjx_upload_analysis_ing = () => ({
    type: 'KTJX_UPLOAD_ANALYSIS_ING'
})

export const ktjx_upload_analysis_done = (data, api_dur) => ({
    type: 'KTJX_UPLOAD_ANALYSIS_DONE',
    data: data,
    api_dur: api_dur
})

export const ktjx_upload_files_err = (err) => ({
    type: 'KTJX_UPLOAD_FILES_ERR',
    err: err
})

// socket
export const ktjx_update_socket = (socket_pack) => ({
    type: 'KTJX_UPDATE_SOCKET',
    socket_pack: socket_pack
})

// kt_jx
export const kt_jx_upload_question_ing = (question) => ({
    type: 'KT_JX_UPLOAD_QUESTION_ING',
    question: question
})

export const kt_jx_upload_question_done = (data) => ({
    type: 'KT_JX_UPLOAD_QUESTION_DONE',
    data: data
})

export const kt_jx_upload_question_err = (err) => ({
    type: 'KT_JX_UPLOAD_QUESTION_ERR',
    err: err
})

export const kt_jx_reset_question = () => ({
    type: 'KT_JX_RESET_QUESTION'
})

// kt_yc
export const kt_yc_upload_question_ing = (question) => ({
    type: 'KT_YC_UPLOAD_QUESTION_ING',
    question: question
})

export const kt_yc_upload_question_done = (data) => ({
    type: 'KT_YC_UPLOAD_QUESTION_DONE',
    data: data
})

export const kt_yc_upload_question_err = (err) => ({
    type: 'KT_YC_UPLOAD_QUESTION_ERR',
    err: err
})

export const kt_yc_reset_question = () => ({
    type: 'KT_YC_RESET_QUESTION'
})

// video
export const vd_reset_video = () => ({
    type: 'VD_RESET_VIDEO'
})

export const vd_drop_video = (file, category) => ({
    type: 'VD_DROP_VIDEO',
    file: file,
    category: category
})

export const vd_send_video_ing = () => ({
    type: 'VD_SEND_VIDEO_ING'
})

export const vd_send_video_err = () => ({
    type: 'VD_SEND_VIDEO_ERR'
})

export const vd_send_video_done = () => ({
    type: 'VD_SEND_VIDEO_DONE'
})

export const vd_analysis_ing = () => ({
    type: 'VD_ANALYSIS_ING'
})

export const vd_analysis_done = (data) => ({
    type: 'VD_ANALYSIS_DONE',
    data: data
})

// zf
// submit a new mission
export const zf_add_mission_ing = () => ({
    type: 'ZF_ADD_MISSION_ING'
})

export const zf_add_mission_done = (data) => ({
    type: 'ZF_ADD_MISSION_DONE',
    data: data
})

export const zf_add_mission_err = (err) => ({
    type: 'ZF_ADD_MISSION_ERR',
    err: err
})

// get missions
export const zf_get_missions_ing = () => ({
    type: 'ZF_GET_MISSIONS_ING'
})

export const zf_get_missions_done = (data) => ({
    type: 'ZF_GET_MISSIONS_DONE',
    data: data
})

export const zf_get_missions_err = (err) => ({
    type: 'ZF_GET_MISSIONS_ERR',
    err: err
})

// get solution
export const zf_get_solution_ing = () => ({
    type: 'ZF_GET_SOLUTION_ING'
})

export const zf_get_solution_done = (data) => ({
    type: 'ZF_GET_SOLUTION_DONE',
    data: data
})

export const zf_get_solution_err = (err) => ({
    type: 'ZF_GET_SOLUTION_ERR',
    err: err
})

// other ops
export const zf_switch_tab = (tabname) => ({
    type: 'ZF_SWITCH_TAB',
    tab: tabname
})

export const zf_switch_mission = (mission_id) => ({
    type: 'ZF_SWITCH_MISSION',
    mission: mission_id
})

export const zf_add_mission = (files) => ({
    type: 'ZF_ADD_MISSION',
    files: files
})

export const zf_update_crop = (crop) => ({
    type: 'ZF_UPDATE_CROP',
    crop: crop
})

export const zf_add_crop = (crop) => ({
    type: 'ZF_ADD_CROP',
    crop: crop
})

export const zf_rm_crop = (index) => ({
    type: 'ZF_RM_CROP',
    index: index
})

// zf admin
// get missions
export const zfadmin_get_missions_ing = () => ({
    type: 'ZFADMIN_GET_MISSIONS_ING'
})

export const zfadmin_get_missions_done = (data) => ({
    type: 'ZFADMIN_GET_MISSIONS_DONE',
    data: data
})

export const zfadmin_get_missions_err = (err) => ({
    type: 'ZFADMIN_GET_MISSIONS_ERR',
    err: err
})

// get solution
export const zfadmin_get_solution_ing = () => ({
    type: 'ZFADMIN_GET_SOLUTION_ING'
})

export const zfadmin_get_solution_done = (data) => ({
    type: 'ZFADMIN_GET_SOLUTION_DONE',
    data: data
})

export const zfadmin_get_solution_err = (err) => ({
    type: 'ZFADMIN_GET_SOLUTION_ERR',
    err: err
})

// update mission
export const zfadmin_update_mission_ing = () => ({
    type: 'ZFADMIN_UPDATE_MISSION_ING'
})

export const zfadmin_update_mission_done = (data) => ({
    type: 'ZFADMIN_UPDATE_MISSION_DONE',
    data: data
})

export const zfadmin_update_mission_err = (err) => ({
    type: 'ZFADMIN_UPDATE_MISSION_ERR',
    err: err
})

// other ops
export const zfadmin_switch_mission = (mission_id) => ({
    type: 'ZFADMIN_SWITCH_MISSION',
    mission: mission_id
})

export const zfadmin_change_solution = (sid, index, value) => ({
    type: 'ZFADMIN_CHANGE_SOLUTION',
    sid: sid,
    index: index,
    value: value
})