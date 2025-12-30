import React from 'react';
import useRecipeStore from '../store/recipeStore';

const TermsOfService = () => {
    const { language } = useRecipeStore();

    return (
        <div className="max-w-4xl mx-auto px-6 py-20 text-text-main">
            <h1 className="text-3xl font-bold mb-8">{language === 'ko' ? '서비스 약관' : 'Terms of Service'}</h1>

            <div className="space-y-6 text-sm leading-relaxed text-slate-400">
                <section>
                    <h2 className="text-lg font-bold text-white mb-2">1. 목적</h2>
                    <p>본 약관은 CHEF 비주얼 레시피 생성기(이하 "서비스")가 제공하는 서비스의 이용조건 및 절차, 이용자와 서비스의 권리, 의무, 책임사항을 규정함을 목적으로 합니다.</p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-white mb-2">2. 약관의 효력과 변경</h2>
                    <p>본 약관은 서비스를 이용하고자 하는 모든 회원에게 적용됩니다. 서비스는 필요한 경우 관련 법령을 위배하지 않는 범위 내에서 본 약관을 변경할 수 있습니다.</p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-white mb-2">3. 서비스의 제공 및 변경</h2>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>AI 기반 레시피 생성 및 이미지 제공</li>
                        <li>레시피 관리 및 공유 기능</li>
                        <li>기타 개발자가 추가하는 기능</li>
                    </ul>
                    <p className="mt-2">서비스는 운영상, 기술상의 필요에 따라 제공하는 서비스의 전부 또는 일부를 수정하거나 중단할 수 있습니다.</p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-white mb-2">4. 회원의 의무</h2>
                    <p>회원은 서비스를 이용할 때 다음 행위를 하여서는 안 됩니다.</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>타인의 정보를 도용하거나 부정하게 사용하는 행위</li>
                        <li>서비스의 정상적인 운영을 방해하거나 해킹을 시도하는 행위</li>
                        <li>불법적인 목적으로 서비스를 이용하는 행위</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-white mb-2">5. 저작권의 귀속 및 이용제한</h2>
                    <p>서비스가 작성한 저작물에 대한 저작권 및 기타 지적재산권은 서비스에 귀속됩니다. 회원이 서비스를 이용하여 생성한 콘텐츠(이미지, 텍스트 등)의 사용권은 회원과 서비스가 공동으로 가집니다.</p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-white mb-2">6. 면책조항</h2>
                    <p>AI가 생성한 레시피와 이미지는 참고용이며, 실제 조리 시 발생할 수 있는 문제나 결과에 대해 서비스는 책임을 지지 않습니다. 알레르기 등 개인의 건강 상태를 고려하여 사용하시기 바랍니다.</p>
                </section>

                <p className="pt-8 border-t border-white/10">본 약관은 2025년 1월 1일부터 시행됩니다.</p>
            </div>
        </div>
    );
};

export default TermsOfService;
