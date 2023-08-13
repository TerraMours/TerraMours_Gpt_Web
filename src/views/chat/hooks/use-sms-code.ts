import { computed } from 'vue';
import { REGEXP_EMAIL } from '@/config';
import {fetchEmailCode } from '@/api';
import  useLoading  from './use-loading';
import useCountDown from './use-count-down';

export default function useSmsCode() {
    const { loading, startLoading, endLoading } = useLoading();
    const { counts, start, isCounting } = useCountDown(60);
  
    const initLabel = '获取验证码';
    const countingLabel = (second: number) => `${second}秒后重新获取`;
    const label = computed(() => {
      let text = initLabel;
      if (loading && loading.value ==true) {
        text = '';
      }
      if (isCounting.value) {
        text = countingLabel(counts.value);
      }
      return text;
    });
  
    /** 判断手机号码格式是否正确 */
    // function isPhoneValid(phone: string) {
    //   let valid = true;
    //   if (phone.trim() === '') {
    //     window.$message?.error('手机号码不能为空！');
    //     valid = false;
    //   } else if (!REGEXP_PHONE.test(phone)) {
    //     window.$message?.error('手机号码格式错误！');
    //     valid = false;
    //   }
    //   return valid;
    // }
    /** 判断邮箱格式是否正确 */
    function isEmailValid(email: string) {
      let valid = true;
      if (email.trim() === '') {
        window.$message?.error('邮箱不能为空！');
        valid = false;
      } else if (!REGEXP_EMAIL.test(email)) {
        window.$message?.error('邮箱格式错误！');
        valid = false;
      }
      return valid;
    }
  
  
    /**
     * 获取邮箱验证码
     * @param email - 邮箱
     */
    async function getEmailCode(email: string) {
      const valid = isEmailValid(email);
      if (!valid || loading.value) return;
  
      startLoading();
      const { data } = await fetchEmailCode(email);
      if (data) {
        window.$message?.success('验证码发送成功！');
        start();
      }
      endLoading();
    }
  
    return {
      label,
      start,
      isCounting,
      getEmailCode,
      loading
    };
  }