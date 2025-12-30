import React from 'react';
import useRecipeStore from '../store/recipeStore';

const PrivacyPolicy = () => {
    const { language } = useRecipeStore();

    return (
        <div className="max-w-4xl mx-auto px-6 py-20 text-text-main">
            <h1 className="text-3xl font-bold mb-8">{language === 'ko' ? '개인정보처리방침' : 'Privacy Policy'}</h1>

            <div className="space-y-6 text-sm leading-relaxed text-slate-400">
                <section>
                    <h2 className="text-lg font-bold text-white mb-2">1. 수집하는 개인정보 항목</h2>
                    <p>CHEF 비주얼 레시피 생성기(이하 "서비스")는 구글 로그인을 통해 다음과 같은 최소한의 개인정보를 수집합니다.</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>이름</li>
                        <li>이메일 주소</li>
                        <li>프로필 사진 URL</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-white mb-2">2. 개인정보의 수집 및 이용 목적</h2>
                    <p>수집한 개인정보는 다음의 목적을 위해 활용됩니다.</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>서비스 이용 자격 확인 (회원 식별)</li>
                        <li>부정 이용 방지 및 서비스 사용량 제한 (일일 생성 횟수 관리)</li>
                        <li>서비스 개선을 위한 통계 분석</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-white mb-2">3. 개인정보의 보유 및 이용 기간</h2>
                    <p>원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계 법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 관계 법령에서 정한 일정한 기간 동안 회원 정보를 보관합니다.</p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-white mb-2">4. 개인정보의 제3자 제공</h2>
                    <p>서비스는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 이용자들이 사전에 동의한 경우나 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우는 예외로 합니다.</p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-white mb-2">5. 문의처</h2>
                    <p>개인정보 관련 문의는 다음 이메일로 연락 주시기 바랍니다: <a href="mailto:phploveme@gmail.com" className="text-primary hover:underline">phploveme@gmail.com</a></p>
                </section>

                <p className="pt-8 border-t border-white/10">본 방침은 2025년 1월 1일부터 시행됩니다.</p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
